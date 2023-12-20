<?php

namespace App\Http\Controllers;

use App\Events\AlertsEvent;
use App\Models\Comments;
use App\Models\Posts;
use App\Models\PostsAction;
use App\Models\Reply;
use App\Models\ProfilePic;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class CommentsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index($id)
    {
        $Comments = Comments::where('postID',$id)->orderBy('date','DESC')->get();
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

    /**
     * It returns a JSON object of all the comments that have the same userID as the one passed in
     * 
     * @param id The id of the user
     * 
     * @return A JSON object of all the comments that have the userID of the user that is logged in.
     */
    public function indexByUser($id)
    {
        return Comments::where('userID',$id)->toJson();
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
        $newComment = new Comments;
        $newComment->userID = $request->input('userID');
        $newComment->what = $request->input('what');
        $newComment->postID = $request->input('postID');
        $newComment->date = Carbon::now();
        if ($newComment->save())
        {
            $PostUser = Posts::where('id',$newComment->postID)->first();
            
            if(Auth::user()->id!=$newComment->userID){
                event(new AlertsEvent(
                    $PostUser->userID,
                    app('App\Http\Controllers\AlertsController')->create($PostUser->userID, "{".$newComment->userID."} commented on you post!", "newComment", Carbon::now()),
                    "newRelation"
                ));
            }
            $newComment->owner = User::where('id',$newComment->userID)->get(['firstName','middleName','lastName'])->first();
            $middleName="";
            if($newComment->owner->middleName) $middleName = $newComment->owner->middleName.' ';
            $newComment->owner = ''.$newComment->owner->firstName.' '.$middleName.$newComment->owner->lastName;
            $newComment->ownerImage = User::where('id',$newComment->userID)->get(['actualProfilePicID'])->first();
            $newComment->ownerImage = ProfilePic::where('id',$newComment->ownerImage->actualProfilePicID)->get(["profilePicURI"])->first();
            return response()->json([$newComment],200);
        }
        return response()->json(['message'=>'Comment Failed To Add'],404);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $comment = Comments::findOrFail($id);
        if($comment){
            $comment->owner = User::where('id',$comment->userID)->get(['firstName','middleName','lastName'])->first();
            $middleName="";
            if($comment->owner->middleName) $middleName = $comment->owner->middleName.' ';
            $comment->owner = ''.$comment->owner->firstName.' '.$middleName.$comment->owner->lastName;
            $comment->ownerImage = User::where('id',$comment->userID)->get(['actualProfilePicID'])->first();
            $comment->ownerImage = ProfilePic::where('id',$comment->ownerImage->actualProfilePicID)->get(["profilePicURI"])->first();
        }
        return $comment;
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
        $comment = Comments::where('id', $id)->first();
        $comment->what = $request->input('what');
        if($comment->save()){
            return response()->json(['message'=>'Comment Successfully Updated'],200);
        }
        return response()->json(['message'=>'Comment To Update'],404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $delete = Comments::where('id',$id)->first();
        if($delete){
            $deleteCommentReactions = PostsAction::where("outsideID",$id)->where("typeofdata","Comment")->get();
            $deleteCommentReactions->map(function($action){
                $action->delete();
            });
            $replies = Reply::where("commentID",$id)->get();
            $replies->map(function($reply){
                $deleteReplyReaction = PostsAction::where("outsideID",$reply->id)->where("typeofdata","Reply")->get();
                $deleteReplyReaction->map(function($action){
                    $action->delete();
                });
            });
            $delete->delete();
            return response()->json(['message'=>'Comment Deleted'],200);
        }
        return response()->json(['message'=>'Comment Not Found'],404);
    }
}
