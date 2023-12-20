<?php

namespace App\Http\Controllers;

use App\Events\AlertsEvent;
use App\Models\Comments;
use App\Models\ProfilePic;
use App\Models\PostsAction;
use Illuminate\Http\Request;
use App\Models\Reply;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class ReplyController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index($id)
    {
        $Reply = Reply::where('commentID', $id)->orderBy('date','DESC')->get();
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
     * It returns all the replies where the userID is equal to the id passed in
     * 
     * @param id the id of the user
     * 
     * @return A collection of replies where the userID is equal to the id passed in.
     */
    public function indexByUser($id)
    {
        return Reply::where('userID', $id)->get();
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
        $new = new Reply;
        $new->userID = $request->input('userID');
        $new->what = $request->input('what');
        $new->commentID = $request->input('commentID');
        $new->date = Carbon::now();
        if ($new->save())
        {
            if(Auth::user()->id!=$new->userID){
                $PostUser = Comments::where('id',$new->commentID)->first();
                event(new AlertsEvent(
                    $PostUser->userID,
                    app('App\Http\Controllers\AlertsController')->create($PostUser->userID, "{".$new->userID."} replied to you comment!", "newReply", Carbon::now()),
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
        return response()->json(['message'=>'Reply Failed To Add'],404);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $rep = Reply::where("id", $id)->first();
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
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $this->validate($request,[
            'what' => 'required',
        ]);
        $update = Reply::where('id', $id)->first();
        if(Auth::user()->id!=$update->userID){
            return response()->json(['message'=>'You can not edit this!'],400);
        }
        $update->what = $request->input('what');
        if($update->save()){
            return response()->json(['message'=>'Reply Successfully Updated'],200);
        }
        return response()->json(['message'=>'Reply To Update'],404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $delete = Reply::where('id',$id)->first();
        if($delete){
            if(Auth::user()->id!=$delete->userID){
                return response()->json(['message'=>'You can not edit this!'],400);
            }
            $deleteReplyReactions = PostsAction::where("outsideID",$id)->where("typeofdata","Reply")->get();
            $deleteReplyReactions->map(function($action){
                $action->delete();
            });
            $delete->delete();
            return response()->json(['message'=>'reply Deleted'],200);
        }
        return response()->json(['message'=>'Reply Not Found'],404);
    }
}
