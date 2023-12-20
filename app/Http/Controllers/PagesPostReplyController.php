<?php

namespace App\Http\Controllers;

use App\Events\AlertsEvent;
use App\Models\PagePostComment;
use App\Models\PagesPostReply;
use App\Models\PagesPostReaction;
use Carbon\Carbon;
use App\Models\User;
use App\Models\ProfilePic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PagesPostReplyController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return PagesPostReply::all();
    }
    /**
     * It gets all the replies to a comment, and then gets the user's name and profile picture
     * 
     * @param id the id of the comment
     * 
     * @return A collection of objects.
     */
    public function indexByID($id)
    {
        $Reply =  PagesPostReply::where('commentID',$id)->orderBy('date','DESC')->get();
        if($Reply){
            $Reply->map(function($rep){
                $rep->owner = User::where('id',$rep->userID)->get(['firstName','middleName','lastName'])->first();
                $middleName="";
                if($rep->owner->middleName) $middleName = $rep->owner->middleName.' ';
                $rep->owner = ''.$rep->owner->firstName.' '.$middleName.$rep->owner->lastName;
                $rep->ownerImage = User::where('id',$rep->userID)->get(['actualProfilePicID'])->first();
                $rep->ownerImage = ProfilePic::where('id',$rep->ownerImage->actualProfilePicID)->get(["profilePicURI"])->first();
            });
        }
        return $Reply;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
         $this->validate($request,[
            'commentID' => 'required',
            'userID' => 'required',
            'what' => 'required',
        ]);
        if(Auth::user()->id!=$request->input('userID')){
            return response()->json(['message'=>'You can not edit this!'],400);
        }
        $new = new PagesPostReply;
        $new->userID = $request->input('userID');
        $new->what = $request->input('what');
        $new->commentID = $request->input('commentID');
        $new->date = Carbon::now();
        if ($new->save())
        {
            $PostUser = PagePostComment::where('id',$new->commentID)->first();
            if(Auth::user()->id!=$PostUser->userID){
                event(new AlertsEvent(
                    $PostUser->userID,
                    app('App\Http\Controllers\AlertsController')->create($PostUser->userID, "{".$new->userID."} replied to you comment!", "newPageReply", Carbon::now()),
                    "newRelation"
                ));
            }
            $new->owner = User::where('id',$new->userID)->get(['firstName','middleName','lastName'])->first();
            $middleName="";
            if($new->owner->middleName) $middleName = $new->owner->middleName.' ';
            $new->owner = ''.$new->owner->firstName.' '.$middleName.$new->owner->lastName;
            $new->ownerImage = User::where('id',$new->userID)->get(['actualProfilePicID'])->first();
            $new->ownerImage = ProfilePic::where('id',$new->ownerImage->actualProfilePicID)->get(["profilePicURI"])->first();
            return response()->json([$new],200);
        }
        return response()->json(['message'=>'PagesPostReply Failed To Add'],404);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\PagesPostReply  $pagesPostReply
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $rep = PagesPostReply::where("id", $id)->first();
        if($rep){
            $rep->owner = User::where('id',$rep->userID)->get(['firstName','middleName','lastName'])->first();
            $middleName="";
            if($rep->owner->middleName) $middleName = $rep->owner->middleName.' ';
            $rep->owner = ''.$rep->owner->firstName.' '.$middleName.$rep->owner->lastName;
            $rep->ownerImage = User::where('id',$rep->userID)->get(['actualProfilePicID'])->first();
            $rep->ownerImage = ProfilePic::where('id',$rep->ownerImage->actualProfilePicID)->get(["profilePicURI"])->first();
        }
        return $rep;
    }
    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\PagesPostReply  $pagesPostReply
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $this->validate($request,[
        'what' => 'required',
        ]);
        $update = PagesPostReply::where('id', $id)->first();
        if(Auth::user()->id!=$update->userID){
            return response()->json(['message'=>'You can not edit this!'],400);
        }
        $update->what = $request->input('what');
        if($update->save()){
            return response()->json(['message'=>'PagesPostReply Successfully Updated'],200);
        }
        return response()->json(['message'=>'PagesPostReply To Update'],404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\PagesPostReply  $pagesPostReply
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $delete = PagesPostReply::where('id',$id)->first();
        if($delete){
            if(Auth::user()->id!=$delete->userID){
                return response()->json(['message'=>'You can not edit this!'],400);
            }
            $deleteReplyReactions = PagesPostReaction::where("outsideID",$id)->where("typeofdata","Reply")->get();
            $deleteReplyReactions->map(function($action){
                $action->delete();
            });
            $delete->delete();
            return response()->json(['message'=>'PagesPostReply Deleted'],200);
        }
        return response()->json(['message'=>'PagesPostReply Not Found'],404);
    }
}
