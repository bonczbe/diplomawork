<?php

namespace App\Http\Controllers;

use App\Models\GroupPostReaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\GroupPostComment;
use App\Models\GroupPostReply;
use Carbon\Carbon;
use App\Events\AlertsEvent;
use App\Http\Controllers\AlertsController;
use Illuminate\Support\Facades\Auth;

class GroupPostReactionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return GroupPostReaction::all();
    }
    /**
     * It returns the number of reactions for a specific post, grouped by the type of reaction
     * 
     * @param id the id of the post
     * @param typeofdata is the type of data that is being reacted to.
     */
    public function indexByActions($id,$typeofdata)
    {
        return DB::table("group_post_reactions")->select("typeOfAction",DB::raw('count(*) as total'))->where("typeofdata",$typeofdata)->where("outsideID",$id)->groupBy('typeOfAction')->get();
    }
    /**
     * It returns all the rows in the database where the userID, outsideID, and typeofdata are equal to
     * the parameters passed in
     * 
     * @param id the id of the post
     * @param type 1 = like, 2 = dislike, 3 = love, 4 = haha, 5 = wow, 6 = sad, 7 = angry
     * @param typeofdata is the type of data that is being reacted to.
     * 
     * @return A collection of GroupPostReaction objects.
     */
    public function indexByType($id,$type,$typeofdata)
    {
        return GroupPostReaction::where('outsideID',$id)->where('typeOfAction',$type)->where("typeofdata",$typeofdata)->get();
    }
    /**
     * It returns all the rows in the database where the userID, outsideID, and typeofdata are equal to
     * the parameters passed in
     * 
     * @param userID The user's ID
     * @param outsideID The ID of the post
     * @param typeofdata 1 = post, 2 = comment, 3 = reply
     * 
     * @return A collection of GroupPostReaction objects.
     */
    public function userAction($userID,$outsideID,$typeofdata)
    {
        return GroupPostReaction::where('userID',$userID)->where('outsideID',$outsideID)->where("typeofdata",$typeofdata)->get();
    }

    /**
     * It checks if the user has a reaction for the post, if not it creates a new reaction
     * 
     * @param Request request The request object.
     * 
     * @return The response is being returned as a JSON object.
     */
    public function store(Request $request)
    {
        $this->validate($request,[
            'outsideID' => 'required',
            'typeOfAction'=> 'required',
            'typeofdata'=> 'required',
            'userID'=> 'required',
        ]);
        if(Auth::user()->id!=$request->input('userID')){
            return response()->json(['message'=>'You can not edit this!'],400);
        }
        $storedAction = GroupPostReaction::where('outsideID',$request->input("outsideID"))->where('typeofdata',$request->input("typeofdata"))->where('userID',$request->input("userID"))->get();
        if(count($storedAction)===0&&($request->input("typeOfAction")=="Star"||$request->input("typeOfAction")=="Meh"||$request->input("typeOfAction")=="Love"||$request->input("typeOfAction")=="WOW"||$request->input("typeOfAction")=="Cry"||$request->input("typeOfAction")=="Laugh"||$request->input("typeOfAction")=="HeartBroken")){
            $new = new GroupPostReaction;
            $new->outsideID = $request->input('outsideID');
            $new->UserID = $request->input('userID');
            $new->typeOfAction = $request->input('typeOfAction');
            $new->typeofdata = $request->input('typeofdata');
            if ($new->save())
            {
                if($new->typeofdata=="Comment"){
                    $Comments = GroupPostComment::where('id',$new->outsideID)->first();
                    $alert = app('App\Http\Controllers\AlertsController')->create($Comments->userID,"{".$new->UserID."} gived a reaction to your reply!{/post/group/".$Comments->postID."}","GroupCommentAction",Carbon::now())->json()['alert'];
                   event(new AlertsEvent($Comments->userID, $alert, "GroupCommentAction"));
                }else if($new->typeofdata=="Reply"){
                    $Reply = GroupPostReply::where('id',$new->outsideID)->first();
                    $Comments = GroupPostComment::where('id',$Reply->commentID)->first();
                    event(new AlertsEvent($Reply->userID,app('App\Http\Controllers\AlertsController')->create($Comments->userID,"{".$new->UserID."} gived a reaction to your reply!{/post/group/".$Comments->postID."}","GroupReplyAction",Carbon::now())->json()['alert'],"GroupReplyAction"));
                }
                return response()->json(["id"=>$new->id,"typeOfAction"=>$new->typeOfAction],200);
            }
            return response()->json(['message'=>'Post Action Failed To Add'],404);
        }else return response()->json(['message'=>'User has a reaction for this'],400);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\GroupPostReaction  $groupPostReaction
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return GroupPostReaction::where('id',$id);
    }
    /**
     * It updates the reaction of a user to a post, comment or reply
     * 
     * @param Request request The request object.
     * @param id The id of the GroupPostReaction
     * 
     * @return The response is being returned as a JSON object.
     */
    public function update(Request $request, $id)
    {
        $this->validate($request,[
            'typeOfAction'=> 'required'
        ]);
        $edit = GroupPostReaction::where('id',$id)->first();
        if(Auth::user()->id!=$edit->userID){
            return response()->json(['message'=>'You can not edit this!'],400);
        }
        $edit->typeOfAction = $request->input('typeOfAction');
        if ($edit->save())
        {
            if($edit->typeofdata=="Comment"){
                $Comments = GroupPostComment::where('id',$edit->outsideID)->first();
                if(Auth::user()->id!=$edit->userID){
                    event(new AlertsEvent($Comments->userID,app('App\Http\Controllers\AlertsController')->create($Comments->userID,"{".$edit->UserID."} gived a reaction to your reply!{/post/group/".$Comments->postID."}","GroupCommentAction",Carbon::now())->json()['alert'],"GroupCommentAction"));
                }
                }else if($edit->typeofdata=="Reply"){
                $Reply = GroupPostReply::where('id',$edit->outsideID)->first();
                $Comments = GroupPostComment::where('id',$Reply->commentID)->first();
                if(Auth::user()->id!=$edit->userID){
                    event(new AlertsEvent($Reply->userID,app('App\Http\Controllers\AlertsController')->create($Comments->userID,"{".$edit->UserID."} gived a reaction to your reply!{/post/group/".$Comments->postID."}","GroupReplyAction",Carbon::now())->json()['alert'],"GroupReplyAction"));
                }
           }
            return response()->json(['message'=>'GroupPostReaction Successfully Updated'],200);
        }
        return response()->json(['message'=>'GroupPostReaction Failed To Update'],404);
    }
    /**
     * It deletes a GroupPostReaction from the database
     * 
     * @param id The id of the GroupPostReaction you want to delete.
     */
    public function destroy($id)
    {
        $delete = GroupPostReaction::where('id',$id)->first();
        if($delete){
            if(Auth::user()->id!=$delete->userID){
                return response()->json(['message'=>'You can not edit this!'],400);
            }
            $delete->delete();
            return response()->json(['message'=>'GroupPostReaction Deleted'],200);
        }
        return response()->json(['message'=>'GroupPostReaction Not Found'],404);
    }
}
