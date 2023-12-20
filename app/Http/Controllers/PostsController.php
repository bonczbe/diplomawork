<?php

namespace App\Http\Controllers;

use App\Models\PostImage;
use App\Models\PostsAction;
use App\Models\Reply;
use App\Models\Comments;
use App\Models\Posts;
use App\Models\ProfilePic;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Events\AlertsEvent;
use App\Models\Relations;
use Illuminate\Support\Facades\Auth;

use function PHPSTORM_META\map;

class PostsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Posts::all()->orderBy('date', 'DESC');
    }
    /**
     * It gets all the posts from the database where the userID is equal to the id passed in, then it
     * gets the user's first name, middle name, last name, and tag, and then it gets the post's files
     * if it has any, and then it gets the user's profile picture
     *
     * @param id The id of the user whose posts you want to see
     *
     * @return A collection of posts.
     */
    public function indexByUser($id)
    {
        $Posts = Posts::where('userID', $id)->orderBy('date', 'DESC')->get(['id','userID','text','isFile','date']);
        if($Posts){
            $Posts->map(function($Post){
                $Post->owner = User::where('id',$Post->userID)->get(['firstName','middleName','lastName','tag'])->first();
                $Post->tag = $Post->owner->tag;
                $middleName="";
                if($Post->owner->middleName) $middleName = $Post->owner->middleName.' ';
                $Post->owner = ''.$Post->owner->firstName.' '.$middleName.$Post->owner->lastName;
                if($Post->isFile){
                    $Post->files = PostImage::where('postID', $Post->id)->get(['id','imageURI']);
                }
                $Post->ownerImage = User::where('id',$Post->userID)->get(['actualProfilePicID'])->first();
                $Post->ownerImage = ProfilePic::where('id',$Post->ownerImage->actualProfilePicID)->get(["profilePicURI"])->first();
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
            'userID' => 'required',
            'text' => 'required',
            'isFile'=>'required'
        ]);

        if(Auth::user()->id!=$request->input('userID')){
            return response()->json(['message'=>'You can not edit this!'],400);
        }
        $newPost = new Posts;
        $newPost->userID = $request->input('userID');
        $newPost->text = $request->input('text');
        $newPost->isFile = $request->input('isFile');
        $newPost->date = Carbon::now();
        $userID = $newPost->userID;
        if ($newPost->save())
        {
            $closeFriends = Relations::where(function($query) use($userID){
                $query->where('user1ID',$userID)->orWhere('user2ID',$userID);
            })->where('type','<',4)->where('type','>',1)->get();
            $closeFriends->map(function ($friend) use ($userID){
                    $otherUser = ($friend->user1ID==$userID)?$friend->user2ID:$friend->user1ID;
                    if(Auth::user()->id!=$otherUser){
                        event(new AlertsEvent(
                            $otherUser,
                            app('App\Http\Controllers\AlertsController')->create($otherUser, "{" . $userID . "} added you as a friend", "newRelation", Carbon::now()),
                            "newPost"
                        ));
                    }
                });
            $newPost->owner = User::where('id',$newPost->userID)->get(['firstName','middleName','lastName'])->first();
                $middleName="";
                if($newPost->owner->middleName) $middleName = $newPost->owner->middleName.' ';
                $newPost->owner = ''.$newPost->owner->firstName.' '.$middleName.$newPost->owner->lastName;
                if($newPost->isFile){
                    $newPost->files = PostImage::where('postID', $newPost->id)->get(['id','imageURI']);
                }
            $newPost->ownerImage = User::where('id',$newPost->userID)->get(['actualProfilePicID'])->first();
            $newPost->ownerImage = ProfilePic::where('id',$newPost->ownerImage->actualProfilePicID)->get(["profilePicURI"])->first();
            return response()->json([$newPost],200);
        }
        return response()->json(['message'=>'Post Failed To Add'],404);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $Post = Posts::find($id);
        if($Post){
            $Post->owner = User::where('id',$Post->userID)->get(['firstName','middleName','lastName'])->first();
            $middleName="";
            if($Post->owner->middleName) $middleName = $Post->owner->middleName.' ';
            $Post->owner = ''.$Post->owner->firstName.' '.$middleName.$Post->owner->lastName;
            if($Post->isFile){
                $Post->files = PostImage::where('postID', $Post->id)->get(['id','imageURI']);
            }
            $Post->ownerImage = User::where('id',$Post->userID)->get(['actualProfilePicID'])->first();
            $Post->ownerImage = ProfilePic::where('id',$Post->ownerImage->actualProfilePicID)->get(["profilePicURI"])->first();
            return $Post;
        }
        return response()->json(['message' => 'Post Not Found',], 404);
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
            'text' => 'required'
        ]);
        $post = Posts::where('id', $id)->first();
        if(Auth::user()->id!=$post->userID){
            return response()->json(['message'=>'You can not edit this!'],400);
        }
        if($request->input("isFile")&&($request->input("isFile")===true||$request->input("isFile")===false)){
            $post->isFile = $request->input('isFile');
        }
        $post->text = $request->input('text');
        if ($post->save())
        {
            return response()->json(['message'=>'Post Successfully Updated'],200);
        }
        return response()->json(['message'=>'Post To Update'],404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $deletePosts = Posts::where('id',$id)->first();
        if($deletePosts){
            if(Auth::user()->id!=$deletePosts->userID){
                return response()->json(['message'=>'You can not edit this!'],400);
            }
            $deletePostReactions = PostsAction::where("outsideID",$id)->where("typeofdata","Post")->get();
            $deletePostReactions->map(function($action){
                $action->delete();
            });
            $comments = Comments::where("postID",$id)->get();
            $comments->map(function($comment){
                $deleteCommentReaction = PostsAction::where("outsideID",$comment->id)->where("typeofdata","Comment")->get();
                $deleteCommentReaction->map(function($action){
                    $action->delete();
                });
                $replies = Reply::where("commentID",$comment->id)->get();
                $replies->map(function($reply){
                    $deleteReplyReaction = PostsAction::where("outsideID",$reply->id)->where("typeofdata","Reply")->get();
                    $deleteReplyReaction->map(function($action){
                        $action->delete();
                    });
                });
            });
            $deletePosts->delete();
            return response()->json(['message'=>'Post Deleted'],200);
        }
        return response()->json(['message'=>'Post Not Found'],404);
    }
}
