<?php

namespace App\Http\Controllers;

use App\Models\Groupchat;
use App\Models\Groupchathelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\GroupChatSettingsEvent;

class GroupChatController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Groupchat::all();
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
            'name' => 'required',
            'userID' => 'required|integer'
        ]);
        $new = new Groupchat;
        $new->name = $request->input('name');
        if ($new->save()) {
            $owner = new Groupchathelper;
            $owner->role = 3;
            $owner->groupChatID = $new->id;
            $owner->userID = $request->input('userID');
            if ($owner->save()) {
                return $new;
            } else {
                $new->delete();
                return response()->json(['message' => 'Something went wrong'], 404);
            }
        }
        return response()->json(['message' => 'Groupchat Failed To Add'], 404);
    }
    /**
     * It updates the profile picture of a groupchat
     * 
     * @param id The id of the groupchat
     * @param Request request The request object.
     */
    public function editProfileID($id, Request $request)
    {
        $this->validate($request, [
            'actualProfilePicID' => 'required',
        ]);

        $isAdmin = Groupchathelper::where("userID", Auth::user()->id)->where('role', '3')->first();
        if (!$isAdmin) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        $edit = Groupchat::where("id", $id)->first();
        if ($edit) {
            $edit->actualProfilePicID = $request->input('actualProfilePicID');
            if ($edit->save()) {
                event(new GroupChatSettingsEvent($edit->id, $edit, "newProfile"));
                return response()->json(['message' => 'Groupchat ProfilePicture Successfully Updated'], 200);
            }
            return response()->json(['message' => 'Groupchat To Update'], 400);
        }
        return response()->json(['message' => 'Groupchat Not found'], 404);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Groupchat::where("id", $id)->first();
    }
    /**
     * It returns the name of the groupchat with the given id
     * 
     * @param id The id of the groupchat you want to get the name of.
     * 
     * @return The name of the groupchat
     */
    public function getName($id)
    {
        $Groupchat = Groupchat::where("id", $id)->get(['name'])->first();
        if ($Groupchat) {
            return $Groupchat->name;
        }
        return response()->json(['message' => 'Groupchat Not Found'], 404);
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
            'name' => 'required'
        ]);
        $isAdmin = Groupchathelper::where("userID", Auth::user()->id)->where('role', '3')->first();
        if (!$isAdmin) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        $new = Groupchat::where("id", $id)->first();
        $new->name = $request->input('name');
        if ($new->save()) {
            event(new GroupChatSettingsEvent($new->id, $new, "edited"));
            return response()->json(['message' => 'GroupChat Successfully Updated'], 200);
        }
        return response()->json(['message' => 'GroupChat Failed To Update'], 404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $delete = Groupchat::where('id', $id)->first();
        if ($delete) {
            $isAdmin = Groupchathelper::where("userID", Auth::user()->id)->where('role', '3')->first();
            if (!$isAdmin) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
            $delete->delete();
            event(new GroupChatSettingsEvent($delete->id, $delete, "destroyChat"));
            return response()->json(['message' => 'GroupChat Deleted'], 200);
        }
        return response()->json(['message' => 'GroupChat Not Found'], 404);
    }
}
