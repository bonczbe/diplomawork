<?php

namespace App\Http\Controllers;

use App\Models\PagesPost;
use App\Models\PagePostComment;
use App\Models\PagesPostReply;
use App\Models\PagesPostReaction;
use Carbon\Carbon;
use App\Models\Page;
use Illuminate\Http\Request;
use App\Models\ProfilePic;
use App\Models\PagesPostImages;
use Illuminate\Support\Facades\Auth;

class PagesPostController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {

        return PagesPost::all()->orderBy('date', 'DESC')->get();
    }
    /**
     * It gets all the posts from a page, and then gets the page's name, and then gets the page's
     * profile picture.
     * </code>
     * 
     * @param id The id of the page
     * 
     * @return A collection of posts.
     */
    public function indexById($id)
    {
        $Posts = PagesPost::where('pageID', $id)->orderBy('date', 'DESC')->get();
        if($Posts){
            $Posts->map(function($Post){
                $Post->owner = Page::where('id',$Post->pageID)->get(['name'])->first();
                $Post->owner = $Post->owner->name;
                if($Post->isFile){
                    $Post->files = PagesPostImages::where('postID', $Post->id)->get(['id','imageURI']);
                }
                $Post->ownerImage = Page::where('id',$Post->pageID)->get(['actualProfilePicID'])->first();
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
            'pageID' => 'required',
            'who' => 'required',
            'text' => 'required',
            'isFile'=>'required'
        ]);
        if(Auth::user()->id!=$request->input('who')){
            return response()->json(['message'=>'You can not edit this!'],400);
        }
        $new = new PagesPost;
        $new->pageID = $request->input('pageID');
        $new->who = $request->input('who');
        $new->text = $request->input('text');
        $new->isFile = $request->input('isFile');
        $new->date = Carbon::now();
        if ($new->save())
        {
            $new->owner = Page::where('id',$new->pageID)->get(['name'])->first();
                $new->owner = ''.$new->owner->name;
                if($new->isFile){
                    $new->files = PagesPostImages::where('postID', $new->id)->get(['id','imageURI']);
                }

            $new->ownerImage = Page::where('id',$new->pageID)->get(['actualProfilePicID'])->first();
            $new->ownerImage = ProfilePic::where('id',$new->ownerImage->actualProfilePicID)->get(["profilePicURI"])->first();
            return response()->json([$new],200);
        }
        return response()->json(['message'=>'PagesPost Failed To Add'],404);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $Post = PagesPost::findOrFail($id);
        if($Post){
                $Post->owner = Page::where('id',$Post->pageID)->get(['name'])->first();
                $Post->owner = $Post->owner->name;
                if($Post->isFile){
                    $Post->files = PagesPostImages::where('postID', $Post->id)->get(['id','imageURI']);
                }
                $Post->ownerImage = Page::where('id',$Post->pageID)->get(['actualProfilePicID'])->first();
                $Post->ownerImage = ProfilePic::where('id',$Post->ownerImage->actualProfilePicID)->get(["profilePicURI"])->first();
                return $Post;
            }
            return response()->json(['message' => 'Post Not Found'], 404);
    }
    /**
     * If the user is not the owner of the post, return a 400 error. Otherwise, update the post
     * 
     * @param Request request The request object.
     * @param id The id of the post you want to update
     */
    public function update(Request $request, $id)
    {

        $this->validate($request,[
            'text' => 'required',
            'who' => 'required'
        ]);
        if(Auth::user()->id!=$request->input('who')){
            return response()->json(['message'=>'You can not edit this!'],400);
        }
        $post = PagesPost::where('id', $id)->first();
        $post->text = $request->input('text');
        if($request->input("isFile")&&($request->input("isFile")===true||$request->input("isFile")===false)){
            $post->isFile = $request->input('isFile');
        }
        $post->who = $request->input('who');
        if ($post->save())
        {
            return response()->json(['message'=>'PagesPost Successfully Updated'],200);
        }
        return response()->json(['message'=>'PagesPost To Update'],404);
    }

    /**
     * It deletes a post, all the reactions to that post, all the comments to that post, all the
     * reactions to those comments, all the replies to those comments, and all the reactions to those
     * replies.
     * </code>
     * 
     * @param id The id of the post you want to delete.
     * 
     * @return The response is being returned as a JSON object.
     */
    public function destroy($id)
    {
        $deletePosts = PagesPost::where('id',$id)->first();
        if($deletePosts){
            if(Auth::user()->id!=$deletePosts->who){
                return response()->json(['message'=>'You can not edit this!'],400);
            }
            $deletePostReactions = PagesPostReaction::where("outsideID",$id)->where("typeofdata","Post")->get();
            $deletePostReactions->map(function($action){
                $action->delete();
            });
            $comments = PagePostComment::where("postID",$id)->get();
            $comments->map(function($comment){
                $deleteCommentReaction = PagesPostReaction::where("outsideID",$comment->id)->where("typeofdata","Comment")->get();
                $deleteCommentReaction->map(function($action){
                    $action->delete();
                });
                $replies = PagesPostReply::where("commentID",$comment->id)->get();
                $replies->map(function($reply){
                    $deleteReplyReaction = PagesPostReaction::where("outsideID",$reply->id)->where("typeofdata","Reply")->get();
                    $deleteReplyReaction->map(function($action){
                        $action->delete();
                    });
                });
            });
            $deletePosts->delete();
            return response()->json(['message'=>'PagesPost Deleted'],200);
        }
        return response()->json(['message'=>'PagesPost Not Found'],404);
    }
}
