<?php

namespace App\Http\Controllers;

use App\Models\PagesPostReaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\PagePostComment;
use App\Models\PagesPostReply;
use App\Events\AlertsEvent;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class PagesPostReactionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return PagesPostReaction::all();
    }
    /**
     * It returns the number of likes, dislikes, and shares for a given post
     * 
     * @param id the id of the post
     * @param typeofdata is the type of data that is being reacted to.
     * 
     * @return Collection
     */
    public function indexByActions($id, $typeofdata)
    {
        return DB::table("pages_post_reactions")->select("typeOfAction", DB::raw('count(*) as total'))->where("typeofdata", $typeofdata)->where("outsideID", $id)->groupBy('typeOfAction')->get();
    }
    /**
     * It returns all the rows from the table where the outsideID is equal to the id passed in, the
     * typeOfAction is equal to the type passed in, and the typeofdata is equal to the typeofdata
     * passed in
     * 
     * @param id the id of the post
     * @param type type of the reaction
     * @param typeofdata is the type of data that is being reacted to.
     * 
     * @return A collection of PagesPostReaction objects.
     */
    public function indexByType($id, $type, $typeofdata)
    {
        return PagesPostReaction::where('outsideID', $id)->where('typeOfAction', $type)->where("typeofdata", $typeofdata)->get();
    }
    /**
     * It returns all the rows from the table where the userID, outsideID and typeofdata are the same
     * as the ones passed to the function
     * 
     * @param userID The ID of the user who reacted to the post
     * @param outsideID The ID of the post
     * @param typeofdata 1 =&gt; post, 2 =&gt; comment, 3 =&gt; reply
     * 
     * @return A collection of PagesPostReaction objects.
     */
    public function userAction($userID, $outsideID, $typeofdata)
    {
        return PagesPostReaction::where('userID', $userID)->where('outsideID', $outsideID)->where("typeofdata", $typeofdata)->get();
    }

    /**
     * It's a function that stores a reaction to a post, comment or reply
     * 
     * @param Request request 
     * 
     * @return The response is being returned as a JSON object.
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'outsideID' => 'required',
            'typeOfAction' => 'required',
            'typeofdata' => 'required',
            'userID' => 'required',
        ]);
        $storedAction = PagesPostReaction::where('outsideID', $request->input("outsideID"))->where('typeofdata', $request->input("typeofdata"))->where('userID', $request->input("userID"))->get();
        if (count($storedAction) === 0 && ($request->input("typeOfAction") == "Star" || $request->input("typeOfAction") == "Meh" || $request->input("typeOfAction") == "Love" || $request->input("typeOfAction") == "WOW" || $request->input("typeOfAction") == "Cry" || $request->input("typeOfAction") == "Laugh" || $request->input("typeOfAction") == "HeartBroken")) {

            if (Auth::user()->id != $request->input('userID')) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
            $new = new PagesPostReaction;
            $new->outsideID = $request->input('outsideID');
            $new->UserID = $request->input('userID');
            $new->typeOfAction = $request->input('typeOfAction');
            $new->typeofdata = $request->input('typeofdata');
            if ($new->save()) {
                if ($new->typeofdata == "Comment") {
                    $Comments = PagePostComment::where('id', $new->outsideID)->first();
                    if (Auth::user()->id != $new->userID) {
                        event(new AlertsEvent($Comments->userID, app('App\Http\Controllers\AlertsController')->create($Comments->userID, "{" . $new->UserID . "} gived a reaction to your comment!{/post/page/" . $Comments->postID . "}", "PageCommentAction", Carbon::now())->json()['alert'], "PageCommentAction"));
                    }
                } else if ($new->typeofdata == "Reply") {
                    $Reply = PagesPostReply::where('id', $new->outsideID)->first();
                    $Comments = PagePostComment::where('id', $Reply->commentID)->first();
                    if (Auth::user()->id != $new->userID) {
                        event(new AlertsEvent($Reply->userID, app('App\Http\Controllers\AlertsController')->create($Comments->userID, "{" . $new->UserID . "} gived a reaction to your reply!{/post/page/" . $Comments->postID . "}", "PageReplyAction", Carbon::now())->json()['alert'], "PageReplyAction"));
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
     * @param  \App\Models\PagesPostReaction  $pagesPostReaction
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return PagesPostReaction::where('id', $id)->get();
    }
    /**
     * It updates the post action of the user.
     * </code>
     * 
     * @param Request request The request object.
     * @param id The id of the post action
     * 
     * @return The response is being returned as a JSON object.
     */
    public function update(Request $request, $id)
    {
        $this->validate($request, [
            'typeOfAction' => 'required'
        ]);
        if ($request->input("typeOfAction") == "Star" || $request->input("typeOfAction") == "Meh" || $request->input("typeOfAction") == "Love" || $request->input("typeOfAction") == "WOW" || $request->input("typeOfAction") == "Cry" || $request->input("typeOfAction") == "Laugh" || $request->input("typeOfAction") == "HeartBroken") {
            $edit = PagesPostReaction::where('id', $id)->first();
            if (Auth::user()->id != $edit->userID) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
            $edit->typeOfAction = $request->input('typeOfAction');
            if ($edit->save()) {
                if ($edit->typeofdata == "Comment") {
                    $Comments = PagePostComment::where('id', $edit->outsideID)->first();
                    if (Auth::user()->id != $edit->userID) {
                        event(new AlertsEvent($Comments->userID, app('App\Http\Controllers\AlertsController')->create($Comments->userID, "{" . $edit->UserID . "} gived a reaction to your comment!{/post/page/" . $Comments->postID . "}", "PageCommentAction", Carbon::now())->json()['alert'], "PageCommentAction"));
                    }
                } else if ($edit->typeofdata == "Reply") {
                    $Reply = PagesPostReply::where('id', $edit->outsideID)->first();
                    $Comments = PagePostComment::where('id', $Reply->commentID)->first();

                    if (Auth::user()->id != $edit->userID) {
                        event(new AlertsEvent($Reply->userID, app('App\Http\Controllers\AlertsController')->create($Comments->userID, "{" . $edit->UserID . "} gived a reaction to your reply!{/post/page/" . $Comments->postID . "}", "PageReplyAction", Carbon::now())->json()['alert'], "PageReplyAction"));
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
     * @param  \App\Models\PagesPostReaction  $pagesPostReaction
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $delete = PagesPostReaction::where('id', $id)->first();
        if ($delete) {
            if (Auth::user()->id != $delete->userID) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
            $delete->delete();
            return response()->json(['message' => 'PagesPostReaction Deleted'], 200);
        }
        return response()->json(['message' => 'PagesPostReaction Not Found'], 404);
    }
}
