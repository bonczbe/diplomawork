<?php

namespace App\Http\Controllers;

use App\Models\PostsAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Events\AlertsEvent;
use App\Models\Reply;
use App\Models\Comments;
use App\Models\Posts;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class PostsActionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return PostsAction::all();
    }
    /**
     * It returns the number of times a user has liked, disliked, or commented on a post
     * 
     * @param id the id of the post
     * @param typeofdata this is the type of data that is being liked, commented, shared, etc.
     */
    public function indexByActions($id, $typeofdata)
    {
        return DB::table("posts_actions")->select("typeOfAction", DB::raw('count(*) as total'))->where('outsideID', $id)->where("typeofdata", $typeofdata)->groupBy('typeOfAction')->get();
    }
    /**
     * It returns all the posts that have the same outsideID, typeOfAction, and typeofdata
     * 
     * @param id the id of the post
     * @param type 1 = like, 2 = comment, 3 = share
     * @param typeofdata is the type of data that is being posted.
     * 
     * @return A collection of PostsAction objects.
     */
    public function indexByType($id, $type, $typeofdata)
    {
        return PostsAction::where('outsideID', $id)->where('typeOfAction', $type)->where("typeofdata", $typeofdata)->get();
    }
    /**
     * It returns all the rows in the table where the userID, outsideID, and typeofdata are equal to
     * the parameters passed in
     * 
     * @param userID The user's ID
     * @param outsideID The ID of the post, comment, or reply.
     * @param typeofdata 1 =&gt; post, 2 =&gt; comment, 3 =&gt; reply
     * 
     * @return A collection of PostsAction objects.
     */
    public function userAction($userID, $outsideID, $typeofdata)
    {
        return PostsAction::where('userID', $userID)->where('outsideID', $outsideID)->where("typeofdata", $typeofdata)->get();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'outsideID' => 'required',
            'typeOfAction' => 'required',
            'typeofdata' => "required",
            'userID' => 'required',
        ]);
        if (Auth::user()->id != $request->input('userID')) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        $storedAction = PostsAction::where('outsideID', $request->input("outsideID"))->where('typeofdata', $request->input("typeofdata"))->where('userID', $request->input("userID"))->get();
        if (count($storedAction) === 0 && ($request->input("typeOfAction") == "Star" || $request->input("typeOfAction") == "Meh" || $request->input("typeOfAction") == "Love" || $request->input("typeOfAction") == "WOW" || $request->input("typeOfAction") == "Cry" || $request->input("typeOfAction") == "Laugh" || $request->input("typeOfAction") == "HeartBroken")) {
            $new = new PostsAction;
            $new->outsideID = $request->input('outsideID');
            $new->UserID = $request->input('userID');
            $new->typeOfAction = $request->input('typeOfAction');
            $new->typeofdata = $request->input('typeofdata');
            if ($new->save()) {
                if ($new->typeofdata == "Post") {
                    $Post = Posts::where('id', $new->outsideID)->first();
                    if (Auth::user()->id != $new->userID) {
                        event(new AlertsEvent($Post->userID, app('App\Http\Controllers\AlertsController')->create($Post->userID, "{" . $new->UserID . "} gived a reaction to your post!{/post/normal/" . $Post->id . "}", "PostAction", Carbon::now()), "PostAction"));
                    }
                } else if ($new->typeofdata == "Comment") {
                    $Comments = Comments::where('id', $new->outsideID)->first();
                    if (Auth::user()->id != $new->userID) {
                        event(new AlertsEvent($Comments->userID, app('App\Http\Controllers\AlertsController')->create($Comments->userID, "{" . $new->UserID . "} gived a reaction to your comment!{/post/normal/" . $Comments->postID . "}", "CommentAction", Carbon::now()), "CommentAction"));
                    }
                } else if ($new->typeofdata == "Reply") {
                    $Reply = Reply::where('id', $new->outsideID)->first();
                    $Comments = Comments::where('id', $Reply->commentID)->first();
                    if (Auth::user()->id != $new->userID) {
                        event(new AlertsEvent($Reply->userID, app('App\Http\Controllers\AlertsController')->create($Reply->userID, "{" . $new->UserID . "} gived a reaction to your reply!{/post/normal/" . $Comments->postID . "}", "ReplyAction", Carbon::now()), "ReplyAction"));
                    }
                }
                return response()->json(["id" => $new->id, "typeOfAction" => $new->typeOfAction], 200);
            }
            return response()->json(['message' => 'Post Action Failed To Add'], 404);
        } else return response()->json(['message' => 'User has a reaction for this'], 400);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return PostsAction::where('id', $id)->get();
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
        $this->validate($request, [
            'typeOfAction' => 'required'
        ]);
        if ($request->input("typeOfAction") == "Star" || $request->input("typeOfAction") == "Meh" || $request->input("typeOfAction") == "Love" || $request->input("typeOfAction") == "WOW" || $request->input("typeOfAction") == "Cry" || $request->input("typeOfAction") == "Laugh" || $request->input("typeOfAction") == "HeartBroken") {
            $edit = PostsAction::where('id', $id)->first();
            if (Auth::user()->id != $edit->userID) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
            $edit->typeOfAction = $request->input('typeOfAction');
            if ($edit->save()) {
                if ($edit->typeofdata == "Post") {
                    $Post = Posts::where('id', $edit->outsideID)->first();
                    if (Auth::user()->id != $edit->userID) {
                        event(new AlertsEvent($Post->userID, app('App\Http\Controllers\AlertsController')->create($Post->userID, "{" . $edit->UserID . "} gived a reaction to your post!{/post/normal/" . $Post->id . "}", "PostAction", Carbon::now()), "PostAction"));
                    }
                } else if ($edit->typeofdata == "Comment") {
                    $Comments = Comments::where('id', $edit->outsideID)->first();
                    if (Auth::user()->id != $edit->userID) {
                        event(new AlertsEvent($Comments->userID, app('App\Http\Controllers\AlertsController')->create($Comments->userID, "{" . $edit->UserID . "} gived a reaction to your comment!{/post/normal/" . $Comments->postID . "}", "CommentAction", Carbon::now()), "CommentAction"));
                    }
                } else if ($edit->typeofdata == "Reply") {
                    $Reply = Reply::where('id', $edit->outsideID)->first();
                    $Comments = Comments::where('id', $Reply->commentID)->first();
                    if (Auth::user()->id != $edit->userID) {
                        event(new AlertsEvent($Reply->userID, app('App\Http\Controllers\AlertsController')->create($Reply->userID, "{" . $edit->UserID . "} gived a reaction to your reply!{/post/normal/" . $Comments->postID . "}", "ReplyAction", Carbon::now()), "ReplyAction"));
                    }
                }
                return response()->json(['message' => 'Post Action Successfully Updated'], 200);
            }
            return response()->json(['message' => 'Post Action Failed To Update'], 404);
        }
        return response()->json(['message' => 'Post Action Failed To Update'], 404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $delete = PostsAction::where('id', $id)->first();
        if ($delete) {
            if (Auth::user()->id != $delete->userID) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
            $delete->delete();
            return response()->json(['message' => 'Post Action Deleted'], 200);
        }
        return response()->json(['message' => 'Post Action Not Found'], 404);
    }
}
