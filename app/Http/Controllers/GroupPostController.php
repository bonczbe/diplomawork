<?php

namespace App\Http\Controllers;

use App\Events\AlertsEvent;
use App\Models\GroupPosts;
use App\Models\GroupPostComment;
use App\Models\GroupPostReply;
use App\Models\GroupPostReaction;
use App\Models\Group;
use App\Models\GroupMember;
use App\Models\User;
use App\Models\ProfilePic;
use Carbon\Carbon;
use App\Models\GroupPostImages;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GroupPostController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index($groupID)
    {
        return GroupPosts::where('groupID',$groupID)->orderBy('date', 'DESC')->get();
    }
    /**
     * This function returns all the posts of a user, ordered by date, in descending order.
     * 
     * @param id the id of the user
     * 
     * @return A collection of GroupPosts
     */
    public function indexByUser($id)
    {
        return GroupPosts::where('who',$id)->orderBy('date', 'DESC')->get();
    }

    /**
     * It gets all the posts from a group and then gets the owner of the post and the owner's profile
     * picture
     * 
     * @param id the id of the group
     * @param userID The user who is requesting the posts
     * 
     * @return A collection of GroupPosts.
     */
    public function indexById($id,$userID)
    {
        $Posts = GroupPosts::where('groupID', $id)->orderBy('date', 'DESC')->get();
        if($Posts){
            $Posts->map(function($Post) use ($userID){
                $Post->owner = User::where('id',$Post->who)->get(['firstName','middleName','lastName'])->first();
                $middleName="";
                if($Post->owner->middleName) $middleName = $Post->owner->middleName.' ';
                $Post->owner = ''.$Post->owner->firstName.' '.$middleName.$Post->owner->lastName;
                if($Post->isFile){
                    $Post->files = GroupPostImages::where('postID', $Post->id)->get(['id','imageURI']);
                }
                $Post->ownerImage = Group::where('id',$Post->groupID)->get(['actualProfileID'])->first();
                $Post->ownerImage = ProfilePic::where('id',$Post->ownerImage->actualProfileID)->get(["profilePicURI"])->first();
            });
        }
        return $Posts;
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
            'groupID' => 'required',
            'who' => 'required',
            'isFile' => 'required',
            'text' => 'required'
        ]);
        if(Auth::user()->id!=$request->input('who')){
            return response()->json(['message'=>'You can not edit this!'],400);
        }
        $new = new GroupPosts;
        $new->groupID = $request->input('groupID');
        $new->who = $request->input('who');
        $new->isFile = $request->input('isFile');
        $new->text = $request->input('text');
        $new->date = Carbon::now();
        if ($new->save())
        {
            $groupUsers=GroupMember::where('groupID',$new->groupID)->where("rank","<","5")->get();
            $groupUsers->map(function($user){
                if($user->memberID!=Auth::user()->id){
                    event(new AlertsEvent($user->memberID,app('App\Http\Controllers\AlertsController')->create($user->memberID,"{".Auth::user()->id."} posted a new thing","newPost",Carbon::now())->json()['alert'],"newGroupPost"));
                }
            });
            $new->owner = User::where('id',$new->who)->get(['firstName','middleName','lastName'])->first();
            $middleName="";
            if($new->owner->middleName) $middleName = $new->owner->middleName.' ';
            $new->owner = ''.$new->owner->firstName.' '.$middleName.$new->owner->lastName;
                if($new->isFile){
                    $new->files = GroupPostImages::where('postID', $new->id)->get(['id','imageURI']);
                }
            $new->ownerImage = Group::where('id',$new->groupID)->get(['actualProfileID'])->first();
            $new->ownerImage = ProfilePic::where('id',$new->ownerImage->actualProfileID)->get(["profilePicURI"])->first();
            return response()->json([$new],200);
        }
        return response()->json(['message'=>'GroupPosts Failed To Add'],404);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $Post = GroupPosts::findOrFail($id);
        if($Post){
                $Post->owner = User::where('id',$Post->who)->get(['firstName','middleName','lastName'])->first();
                $middleName="";
                if($Post->owner->middleName) $middleName = $Post->owner->middleName.' ';
                $Post->owner = ''.$Post->owner->firstName.' '.$middleName.$Post->owner->lastName;
                if($Post->isFile){
                    $Post->files = GroupPostImages::where('postID', $Post->id)->get(['id','imageURI']);
                }
                $Post->ownerImage = Group::where('id',$Post->groupID)->get(['actualProfileID'])->first();
                $Post->ownerImage = ProfilePic::where('id',$Post->ownerImage->actualProfileID)->get(["profilePicURI"])->first();
                return $Post;
            }
            return response()->json(['message' => 'Post Not Found'], 404);
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
        if(!Auth::check()) return response()->json(['message'=>'Permissoin denied access'],404);
        $this->validate($request,[
            'text' => 'required'
        ]);
        $post = GroupPosts::where('id', $id)->first();
        if(Auth::user()->id!=$post->who){
            return response()->json(['message'=>'You can not edit this!'],400);
        }
        $post->text = $request->input('text');
        if ($post->save())
        {
            return response()->json(['message'=>'GroupPosts Successfully Updated'],200);
        }
        return response()->json(['message'=>'GroupPosts To Update'],404);
    }
    /**
     * It deletes a post, all the reactions to that post, all the comments to that post, all the
     * reactions to those comments, all the replies to those comments, and all the reactions to those
     * replies
     * 
     * @param id The id of the post you want to delete
     * 
     * @return The response is being returned as a JSON object.
     */
    public function destroy($id)
    {
        $deletePosts = GroupPosts::where('id',$id)->first();
        if($deletePosts){
            if(Auth::user()->id!=$deletePosts->who){
                return response()->json(['message'=>'You can not edit this!'],400);
            }
            $deletePostReactions = GroupPostReaction::where("outsideID",$id)->where("typeofdata","Post")->get();
            $deletePostReactions->map(function($action){
                $action->delete();
            });
            $comments = GroupPostComment::where("postID",$id)->get();
            $comments->map(function($comment){
                $deleteCommentReaction = GroupPostReaction::where("outsideID",$comment->id)->where("typeofdata","Comment")->get();
                $deleteCommentReaction->map(function($action){
                    $action->delete();
                });
                $replies = GroupPostReply::where("commentID",$comment->id)->get();
                $replies->map(function($reply){
                    $deleteReplyReaction = GroupPostReaction::where("outsideID",$reply->id)->where("typeofdata","Reply")->get();
                    $deleteReplyReaction->map(function($action){
                        $action->delete();
                    });
                });
            });
            $deletePosts->delete();
            return response()->json(['message'=>'GroupPosts Deleted'],200);
        }
        return response()->json(['message'=>'GroupPosts Not Found'],404);
    }
}
