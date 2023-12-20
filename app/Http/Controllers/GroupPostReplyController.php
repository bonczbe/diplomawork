<?php

namespace App\Http\Controllers;

use App\Events\AlertsEvent;
use App\Models\GroupPostComment;
use App\Models\GroupPostReply;
use App\Models\GroupPostReaction;
use Carbon\Carbon;
use App\Models\User;
use App\Models\ProfilePic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GroupPostReplyController extends Controller
{
    /**
     * It gets all the replies of a comment and then maps the replies to get the owner of the reply and
     * the owner's profile picture
     * 
     * @param id the id of the comment
     * 
     * @return A collection of GroupPostReply objects.
     */
    public function index($id)
    {
        $Reply =  GroupPostReply::where('commentID',$id)->orderBy('date','DESC')->get();
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
     * It takes a request, validates it, and then adds it to the database
     * 
     * @param Request request 
     * 
     * @return The new reply object.
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
        $new = new GroupPostReply;
        $new->userID = $request->input('userID');
        $new->what = $request->input('what');
        $new->commentID = $request->input('commentID');
        $new->date = Carbon::now();
        if ($new->save())
        {
            if(Auth::user()->id!=$new->userID){
                $PostUser = GroupPostComment::where('id',$new->commentID)->first();
                event(new AlertsEvent(
                    $PostUser->userID,
                    app('App\Http\Controllers\AlertsController')->create($PostUser->userID, "{".$new->userID."} replied to you comment!", "newGroupReply", Carbon::now()),
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
        return response()->json(['message'=>'GroupPostReply Failed To Add'],404);
    }

   /**
    * It returns all the replies to a post in a group
    * 
    * @param id The id of the group post reply
    * 
    * @return A collection of GroupPostReply objects.
    */
    public function show($id)
    {
        $rep = GroupPostReply::where("id", $id)->get();
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
     * It updates the `what` column of the `group_post_replies` table where the `id` is equal to the
     * `` variable
     * 
     * @param Request request The request object.
     * @param id The id of the GroupPostReply you want to update.
     */
    public function update(Request $request, $id)
    {
        $this->validate($request,[
            'what' => 'required',
        ]);
        $update = GroupPostReply::where('id', $id)->first();
        if(Auth::user()->id!=$update->userID){
            return response()->json(['message'=>'You can not edit this!'],400);
        }
        $update->what = $request->input('what');
        if($update->save()){
            return response()->json(['message'=>'GroupPostReply Successfully Updated'],200);
        }
        return response()->json(['message'=>'GroupPostReply To Update'],404);
    }
   /**
    * It deletes a reply to a post in a group
    * 
    * @param id The id of the reply you want to delete.
    * 
    * @return The response is being returned as a JSON object.
    */
    public function destroy($id)
    {
        $delete = GroupPostReply::where('id',$id)->first();
        if($delete){
            if(Auth::user()->id!=$delete->userID){
                return response()->json(['message'=>'You can not edit this!'],400);
            }
            $deleteReplyReactions = GroupPostReaction::where("outsideID",$id)->where("typeofdata","Reply")->get();
            $deleteReplyReactions->map(function($action){
                $action->delete();
            });
            $delete->delete();
            return response()->json(['message'=>'GroupPostReply Deleted'],200);
        }
        return response()->json(['message'=>'GroupPostReply Not Found'],404);
    }
}
