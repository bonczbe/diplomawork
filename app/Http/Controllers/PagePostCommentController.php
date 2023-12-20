<?php

namespace App\Http\Controllers;

use App\Models\PagePostComment;
use App\Models\PagesPostReply;
use App\Models\PagesPostReaction;
use App\Models\ProfilePic;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PagePostCommentController extends Controller
{
    /**
     * It gets all the comments for a post, then it gets the user's name and profile picture for each
     * comment.
     * 
     * @param id the id of the post
     * 
     * @return A collection of comments.
     */
    public function index($id)
    {
        $Comments = PagePostComment::where('postID',$id)->orderBy('date','DESC')->get();
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
     * It takes a request, validates it, checks if the user is the owner of the comment, creates a new
     * comment, saves it, and returns the comment
     * 
     * @param Request request 
     * 
     * @return The new comment that was just added.
     */
    public function store(Request $request)
    {
        $this->validate($request,[
            'postID' => 'required',
            'userID' => 'required',
            'text' => 'required'
        ]);
        if(Auth::user()->id!=$request->input('userID')){
            return response()->json(['message'=>'You can not edit this!'],400);
        }
        $new = new PagePostComment;
        $new->postID = $request->input('postID');
        $new->userID = $request->input('userID');
        $new->text = $request->input('text');
        $new->date = Carbon::now();
        if ($new->save())
        {
            $new->owner = User::where('id',$new->userID)->get(['firstName','middleName','lastName'])->first();
            $middleName="";
            if($new->owner->middleName) $middleName = $new->owner->middleName.' ';
            $new->owner = ''.$new->owner->firstName.' '.$middleName.$new->owner->lastName;
            $new->ownerImage = User::where('id',$new->userID)->get(['actualProfilePicID'])->first();
            $new->ownerImage = ProfilePic::where('id',$new->ownerImage->actualProfilePicID)->get(["profilePicURI"])->first();
            return response()->json([$new],200);
        }
        return response()->json(['message'=>'PagePostComment Failed To Add'],404);
    }

    /**
     * Return the PagePostComment where the id is equal to the id passed in.
     * 
     * @param id The id of the comment you want to show.
     * 
     * @return A collection of PagePostComment objects.
     */
    public function show($id)
    {
        $Comment = PagePostComment::findOrFail($id);
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
     * It updates the text of a comment if the user is the owner of the comment
     * 
     * @param Request request The request object.
     * @param id The id of the comment you want to update.
     * 
     * @return The response is being returned as a JSON object.
     */
    public function update(Request $request, $id)
    {
        $this->validate($request,[
            'text' => 'required'
        ]);
        $post = PagePostComment::where('id', $id)->first();
        if(Auth::user()->id!=$post->userID){
            return response()->json(['message'=>'You can not edit this!'],400);
        }
        $post->text = $request->input('text');
        if ($post->save())
        {
            return response()->json(['message'=>'PagePostComment Successfully Updated'],200);
        }
        return response()->json(['message'=>'PagePostComment To Update'],404);
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
        $deletePosts = PagePostComment::where('id',$id)->first();
        if($deletePosts){
            if(Auth::user()->id!=$deletePosts->userID){
                return response()->json(['message'=>'You can not edit this!'],400);
            }
            $deleteCommentReactions = PagesPostReaction::where("outsideID",$id)->where("typeofdata","Comment")->get();
            $deleteCommentReactions->map(function($action){
                $action->delete();
            });
            $replies = PagesPostReply::where("commentID",$id)->get();
            $replies->map(function($reply){
                $deleteReplyReaction = PagesPostReaction::where("outsideID",$reply->id)->where("typeofdata","Reply")->get();
                $deleteReplyReaction->map(function($action){
                    $action->delete();
                });
            });
            $deletePosts->delete();
            return response()->json(['message'=>'PagePostComment Deleted'],200);
        }
        return response()->json(['message'=>'PagePostComment Not Found'],404);
    }
}
