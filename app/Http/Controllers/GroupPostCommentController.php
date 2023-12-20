<?php

namespace App\Http\Controllers;

use App\Events\AlertsEvent;
use App\Models\GroupPostComment;
use App\Models\GroupPostReply;
use App\Models\GroupPostReaction;
use App\Models\GroupPosts;
use App\Models\ProfilePic;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GroupPostCommentController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index($id)
    {
        $Comments =  GroupPostComment::where('postID',$id)->orderBy('date','DESC')->get();
        if($Comments){
            $Comments->map(function($Comment){
                $Comment->owner = User::where('id',$Comment->userID)->get(['firstName','middleName','lastName'])->first();
                $middleName="";
                if($Comment->owner->middleName) $middleName = $Comment->owner->middleName.' ';
                $Comment->owner = ''.$Comment->owner->firstName.' '.$middleName.$Comment->owner->lastName;
                $Comment->ownerImage = User::where('id',$Comment->userID)->get(['actualProfilePicID'])->first();
                $Comment->ownerImage = ProfilePic::where('id',$Comment->ownerImage->actualProfilePicID)->get(["profilePicURI"])->first();
            });

        }
        return $Comments;
    }
    public function indexByUser($id)
    {
        return GroupPostComment::where('userID',$id)->get();
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
            'postID' => 'required',
            'userID' => 'required',
            'what' => 'required',
        ]);
        if(Auth::user()->id!=$request->input('userID')){
            return response()->json(['message'=>'You can not edit this!'],400);
        }
        $new = new GroupPostComment;
        $new->userID = $request->input('userID');
        $new->what = $request->input('what');
        $new->postID = $request->input('postID');
        $new->date = Carbon::now();
        if ($new->save())
        {
            $PostUser = GroupPosts::where('id',$new->postID)->first();
            
            if(Auth::user()->id!=$new->userID){
                event(new AlertsEvent(
                    $PostUser->who,
                    app('App\Http\Controllers\AlertsController')->create($PostUser->who, "{".$new->userID."} commented on your post!", "newGroupComment", Carbon::now()),
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
        return response()->json(['message'=>'GroupPostComment Failed To Add'],404);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\GroupPostComment  $groupPostComment
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $Comment = GroupPostComment::findOrFail($id);
        if($Comment){
            $Comment->owner = User::where('id',$Comment->userID)->get(['firstName','middleName','lastName'])->first();
            $middleName="";
            if($Comment->owner->middleName) $middleName = $Comment->owner->middleName.' ';
            $Comment->owner = ''.$Comment->owner->firstName.' '.$middleName.$Comment->owner->lastName;
            $Comment->ownerImage = User::where('id',$Comment->userID)->get(['actualProfilePicID'])->first();
            $Comment->ownerImage = ProfilePic::where('id',$Comment->ownerImage->actualProfilePicID)->get(["profilePicURI"])->first();
        }
        return $Comment;
    }
    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\GroupPostComment  $groupPostComment
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $this->validate($request,[
            'what' => 'required',
        ]);
        $comment = GroupPostComment::where('id', $id)->first();
        if(Auth::user()->id!=$comment->userID){
            return response()->json(['message'=>'You can not edit this!'],400);
        }
        $comment->what = $request->input('what');
        if($comment->save()){
            return response()->json(['message'=>'GroupPostComment Successfully Updated'],200);
        }
        return response()->json(['message'=>'GroupPostComment To Update'],404);
    }
    /**
     * It deletes a comment and all of its reactions and replies and their reactions.
     * </code>
     * 
     * @param id The id of the comment you want to delete.
     * 
     * @return The response is being returned as a JSON object.
     */
    public function destroy($id)
    {
        $delete = GroupPostComment::where('id',$id)->first();
        if($delete){
            if(Auth::user()->id!=$delete->userID){
                return response()->json(['message'=>'You can not edit this!'],400);
            }
            $deleteCommentReactions = GroupPostReaction::where("outsideID",$id)->where("typeofdata","Comment")->get();
            $deleteCommentReactions->map(function($action){
                $action->delete();
            });
            $replies = GroupPostReply::where("commentID",$id)->get();
            $replies->map(function($reply){
                $deleteReplyReaction = GroupPostReaction::where("outsideID",$reply->id)->where("typeofdata","Reply")->get();
                $deleteReplyReaction->map(function($action){
                    $action->delete();
                });
            });
            $delete->delete();
            return response()->json(['message'=>'GroupPostComment Deleted'],200);
        }
        return response()->json(['message'=>'GroupPostComment Not Found'],404);
    }
}
