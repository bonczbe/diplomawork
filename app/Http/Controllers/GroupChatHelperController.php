<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Groupchathelper;
use App\Models\Groupchat;
use Illuminate\Support\Facades\Auth;
use App\Models\Groupmessage;
use App\Events\GroupChatSettingsEvent;
use App\Models\User;
use App\Models\ProfilePic;

class GroupChatHelperController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Groupchathelper::all();
    }

    /**
     * It gets all the group chats that a user is in, and then adds the name of the group chat, the
     * type of chat, and the profile picture of the group chat to the object
     *
     * @param id the id of the user
     *
     * @return A collection of Groupchathelper objects.
     */
    public function indexByUser($id)
    {
        $helper = Groupchathelper::where('userID', $id)->get();
        $helper->map(function ($group) {
            $getName = Groupchat::where('id', $group->groupChatID)->first();
            $group->name = $getName->name;
            $group->type = "groupChat";
            $group->ProfilePicURI = ProfilePic::where("id", $getName->actualProfilePicID)->get(['profilePicURI'])->first();
        });
        return $helper;
    }
    /**
     * It gets all the members of a group chat and returns their names and profile pictures.
     * </code>
     *
     * @param id the id of the groupchat
     *
     * @return Collection
     */
    public function indexMembers($id)
    {
        $helper = Groupchathelper::where('groupChatID', $id)->get();
        $helper->map(function ($group) {
            $getName = User::where('id', $group->userID)->first();
            $group->name = '' . $getName->firstName . ' ' . (($getName->middleName) ? ($getName->middleName . ' ') : '') . $getName->lastName;
            $group->ProfilePicURI = ProfilePic::where("id", $getName->actualProfilePicID)->get(['profilePicURI'])->first();
        });
        return $helper;
    }
    /**
     * It returns the last message sent in a group chat, and if there is no message, it returns "empty"
     *
     * @param userID The user's ID
     * @param groupChatID The ID of the group chat
     *
     * @return the last message sent in the group chat.
     */
    public function indexByUserMessage($userID, $groupChatID)
    {
        $messages = Groupmessage::where("groupChatID", $groupChatID)->orderBy('date', 'DESC')->first();
        $helper = Groupchathelper::where("groupChatID", $groupChatID)->where('userID', $userID)->first();
        if ($helper && $helper->role != 4 && $messages) {
            $helper->messageData = $messages;
            return $helper;
        } else if (!$messages && $helper && $helper->role != 4) {
            return "empty";
        }
        return "blocked";
    }
    /**
     * It returns all the rows in the table where the groupChatID is equal to the groupChatID passed to
     * the function
     *
     * @param groupChatID The ID of the group chat
     *
     * @return A collection of Groupchathelper objects.
     */
    public function indexByChatID($groupChatID)
    {
        return Groupchathelper::where("groupChatID", $groupChatID)->get();
    }



    /**
     * It adds a new member to a group chat
     *
     * @param Request request The request object.
     *
     * @return The response is a JSON object with the message "GroupchatHelper Failed To Add"
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'userID' => 'required',
            'groupChatID' => 'required',
            'role' => 'required',
        ]);
        $helper = Groupchathelper::where("groupChatID", $request->input('groupChatID'))->where('userID', $request->input('userID'))->first();
        $isAdmin = Groupchathelper::where("userID", Auth::user()->id)->where('role', '<', '4')->where('role', '>', '1')->first();
        if (!$isAdmin) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        if ($helper) {
            return response()->json(['message' => 'Member already exist in the Chat!'], 401);
        }
        $new = new Groupchathelper;
        $new->userID = $request->input('userID');
        $new->groupChatID = $request->input('groupChatID');
        $new->role = $request->input('role');
        if ($new->save()) {
            event(new GroupChatSettingsEvent($new->id, $new, "newMember"));
            return $new;
        }
        return response()->json(['message' => 'GroupchatHelper Failed To Add'], 404);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Groupchathelper::where('groupChatID', $id)->get();
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
            'role' => 'required',
        ]);
        $isAdmin = Groupchathelper::where("userID", Auth::user()->id)->where('role', '<', '4')->where('role', '>', '1')->first();
        if (!$isAdmin) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        $new = Groupchathelper::where("id", $id)->first();

        if ($new) {
            if ($request->input('role') == 3) {
                $existing = Groupchathelper::where("groupChatID", $new->groupChatID)->where("role", 3)->first();
                if ($existing) return response()->json(['message' => 'Groupchat has owner!'], 401);
            }
            $new->role = $request->input('role');
            if ($new->save()) {
                event(new GroupChatSettingsEvent($new->id, $new, "newRole"));
                return $new;
            }
        }
        return response()->json(['message' => 'Groupchat or user Not found!'], 404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $delete = Groupchathelper::where('id', $id)->first();
        if ($delete) {
            event(new GroupChatSettingsEvent($delete->id, $delete, "removeMember"));
            $delete->delete();
            return response()->json(['message' => 'Groupchathelper Deleted'], 200);
        }
        return response()->json(['message' => 'Groupchathelper Not Found'], 404);
    }
}
