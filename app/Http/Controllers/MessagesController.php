<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Messages;
use App\Models\MessagesData;
use Illuminate\Support\Facades\Auth;
use App\Models\Relations;
use App\Events\PrivateChatSettingsEvent;
use App\Models\Groupchat;
use Illuminate\Database\Eloquent\Relations\Relation;
use App\Models\Groupchathelper;
use App\Models\Groupmessage;
use App\Models\ProfilePic;
use App\Models\User;

class MessagesController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Messages::all();
    }
    /**
     * It returns the messages between two users, if they are not blocked
     * 
     * @param user1ID The ID of the user who is logged in
     * @param user2ID The user you want to send a message to.
     * 
     * @return the message data.
     */
    public function indexByUser($user1ID, $user2ID)
    {
        if (Auth::user()->id != $user1ID && Auth::user()->id != $user2ID) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        if ($user1ID == $user2ID) return response()->json(['message' => "2 user cannot be the same!"], 400);
        $messages = Messages::where(function ($query) use ($user1ID) {
            $query->where("user1ID", $user1ID)->orWhere('user2ID', $user1ID);
        })->where(function ($query) use ($user2ID) {
            $query->where("user1ID", $user2ID)->orWhere('user2ID', $user2ID);
        })->first();
        if (!$messages) {
            $messages = new Messages();
            $messages->user1ID = $user1ID;
            $messages->user2ID = $user2ID;
            $messages->save();
        }
        $helper = Relations::where(function ($first) use ($user1ID) {
            $first->where("user1ID", $user1ID)->orWhere('user2ID', $user1ID);
        })->where(function ($first) use ($user2ID) {
            $first->where("user1ID", $user2ID)->orWhere('user2ID', $user2ID);
        })->first();
        if (!isset($helper) || ($helper && $helper->type != 4)) {
            $help = MessagesData::where('messageID', $messages->id)->orderBy('sentData', 'DESC')->first();
            if ($help) {
                $messages->messageData = $help;
            } else {
                $messages->messageData = "empty";
            }
        }
        return ($messages && (!isset($helper) || ($helper && $helper->type != 4))) ? $messages : (($helper && $helper->type == 4) ? "blocked" : null);
    }

    /**
     * It returns the last message of a user or a groupchat
     * 
     * @param userID1 The logged in user's ID
     * @param userID2 The userID of the user you want to chat with
     * @param type user or groupChat
     * 
     * @return a json object
     *
     **/
    public function fromRight($userID1, $userID2, $type)
    {     //userID1 is the Realtion->user1ID or the logged in user and userID2 is the Realtion->user2ID or the groupchatID
        if (Auth::user()->id != $userID1 && Auth::user()->id != $userID2) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        if ($type == "user") {
            $returning = Messages::where(
                function ($query) use ($userID1, $userID2) {
                    $query->where('user1ID', $userID1)
                        ->where('user2ID', $userID2);
                }
            )->orWhere(
                function ($query) use ($userID1, $userID2) {
                    $query->where('user2ID', $userID1)
                        ->where('user1ID', $userID2);
                }
            )->first();
            if ($returning) {
                $helper = clone $returning;
                $otherUserID = (Auth::user()->id == $userID1) ? $userID2 : $userID1;
                $selectedUser = User::where('id', $otherUserID)->first();
                $returning->name = $selectedUser->firstName . " " . (($selectedUser->middleName) ? ($selectedUser->middleName . " ") : "") . $selectedUser->lastName;
                $returning->type = $type;
                $returning->datas = $helper;
                $helper = Relations::where(function ($first) {
                    $first->where("user1ID", Auth::user()->id)->orWhere('user2ID', Auth::user()->id);
                })->where(function ($first) use ($otherUserID) {
                    $first->where("user1ID", $otherUserID)->orWhere('user2ID', $otherUserID);
                })->first();
                if (!isset($helper) || ($helper && $helper->type != 4)) {
                    $help = MessagesData::where('messageID', $returning->id)->orderBy('sentData', 'DESC')->first();
                    if ($help) {
                        $returning->datas->messageData = $help;
                    } else {
                        $returning->datas->messageData = "empty";
                    }
                } else {
                    $returning->datas->messageData = "blocked";
                }
                return $returning;
            }else{
                $otherUserID = (Auth::user()->id == $userID1) ? $userID2 : $userID1;
                $helper = Relations::where(function ($first) {
                    $first->where("user1ID", Auth::user()->id)->orWhere('user2ID', Auth::user()->id);
                })->where(function ($first) use ($otherUserID) {
                    $first->where("user1ID", $otherUserID)->orWhere('user2ID', $otherUserID);
                })->first();
                if (!isset($helper) || ($helper && $helper->type != 4)) {
                    $new = new Messages;
                    $new->user1ID = $userID1;
                    $new->user2ID = $userID2;
                    $new->save();
                    $returning = $new;
                    $selectedUser = User::where('id', $otherUserID)->first();
                    $returning->name = $selectedUser->firstName . " " . (($selectedUser->middleName) ? ($selectedUser->middleName . " ") : "") . $selectedUser->lastName;
                    $returning->type = $type;
                    $returning->datas = clone $new;
                    if (!isset($helper) || ($helper && $helper->type != 4)) {
                        $help = MessagesData::where('messageID', $returning->id)->orderBy('sentData', 'DESC')->first();
                        if ($help) {
                            $returning->datas->messageData = $help;
                        } else {
                            $returning->datas->messageData = "empty";
                        }
                    } else {
                        $returning->datas->messageData = "blocked";
                    }
                    return $returning;
                }
            }
        } else if ($type == "groupChat") {
            $returning = Groupchathelper::where("userID", $userID1)->where('groupChatID', $userID2)->first();
            if ($returning) {
                $helper = clone $returning;
                $selectedGroupChat = Groupchat::where('id', $returning->groupChatID)->first();
                $returning->name = $selectedGroupChat->name;
                $returning->type = $type;
                $returning->ProfilePicURI = ProfilePic::where("id", $selectedGroupChat->actualProfilePicID)->get(['profilePicURI'])->first();
                $returning->datas = $helper;
                $help = Groupmessage::where("groupChatID", $userID2)->orderBy('date', 'DESC')->first();
                if ($helper && $helper->role != 5 && $help) {
                    $returning->datas->messageData = $help;
                } else if (!$help && $helper && $helper->role != 5) {
                    $returning->datas->messageData = "empty";
                } else {
                    $returning->datas->messageData = "blocked";
                }
                return $returning;
            }
        }
        return response()->json(['message' => 'Not found'], 404);
    }
    /**
     * It returns all the messages of a user
     * 
     * @param userID The user's ID
     * 
     * @return A collection of messages.
     */
    public function allMessages($userID)
    {
        if (Auth::user()->id != $userID) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        $messages = Messages::where(function ($query) use ($userID) {
            $query->where("user1ID", $userID)->orWhere('user2ID', $userID);
        })->get();

        $messages = $messages->map(function ($message) use ($userID) {
            $helper = clone $message;
            $otherUserID = ($message->user1ID == $userID) ? $message->user2ID : $message->user1ID;
            $selectedUser = User::where('id', $otherUserID)->first();
            $message->name = $selectedUser->firstName . " " . (($selectedUser->middleName) ? ($selectedUser->middleName . " ") : "") . $selectedUser->lastName;
            $message->type = "user";
            $message->channelID = $message->user1ID . "" . $message->user2ID;
            $userIDhelper = $userID;
            $message->datas = $helper;
            $helper = Relations::where(function ($first) use ($userIDhelper) {
                $first->where("user1ID", $userIDhelper)->orWhere('user2ID', $userIDhelper);
            })->where(function ($first) use ($otherUserID) {
                $first->where("user1ID", $otherUserID)->orWhere('user2ID', $otherUserID);
            })->first();
            if (!isset($helper) || ($helper && $helper->type != 4)) {
                $help = MessagesData::where('messageID', $message->id)->orderBy('sentData', 'DESC')->first();
                if ($help) {
                    $message->datas->messageData = $help;
                } else {
                    $message->datas->messageData = "empty";
                }
            } else {
                $message->datas->messageData = "blocked";
            }
            return $message;
        });

        $groupMessages = Groupchathelper::where("userID", $userID)->get();

        $groupMessages = $groupMessages->map(function ($message) use ($userID) {
            $helper = clone $message;
            $groupChatID = $message->groupChatID;
            $selectedGroupChat = Groupchat::where('id', $message->groupChatID)->first();
            $message->name = $selectedGroupChat->name;
            $message->type = "groupChat";
            $message->channelID = $groupChatID;
            $message->ProfilePicURI = ProfilePic::where("id", $message->actualProfilePicID)->get(['profilePicURI'])->first();
            $message->datas = $helper;
            $help = Groupmessage::where("groupChatID", $groupChatID)->orderBy('date', 'DESC')->first();
            $helper = Groupchathelper::where("groupChatID", $groupChatID)->where('userID', $userID)->first();
            if ($helper && $helper->role != 5 && $help) {
                $message->datas->messageData = $help;
            } else if (!$help && $helper && $helper->role != 5) {
                $message->datas->messageData = "empty";
            } else {
                $message->datas->messageData = "blocked";
            }
            return $message;
        });
        $mergedMessages = $messages->concat($groupMessages)->sortBy(function ($message) {
            if (isset($message->datas->messageData->sentData) || isset($message->datas->messageData->date)) {
                $a = isset($message->datas->messageData->sentData) ? $message->datas->messageData->sentData : $message->datas->messageData->date;
                return -strtotime($a);
            } else {
                return PHP_INT_MAX;
            }
        })->values();
        return $mergedMessages;
    }

    /**
     * It checks if the user is blocked by the other user or not, if not then it creates a new message.
     * </code>
     * 
     * @param Request request The request object.
     * 
     * @return The response is being returned as a JSON object.
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'user1ID' => 'required',
            'user2ID' => 'required'
        ]);
        $user1ID = $request->input('user1ID');
        $user2ID = $request->input('user2ID');
        if (Auth::user()->id != $user2ID && Auth::user()->id != $user1ID) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        if ($user1ID == $user2ID) return response()->json(['message' => "2 user cannot be the same!"], 400);

        $isBlockedSomeOne = Relation::where(function ($query) use ($user1ID, $user2ID) {
            $query->where('user1ID', $user1ID)
                ->orWhere('user1ID', $user2ID);
        })->where(function ($query) use ($user1ID, $user2ID) {
            $query->where('user2ID', $user1ID)
                ->orWhere('user2ID', $user2ID);
        })->first();
        $decide = ($isBlockedSomeOne && $isBlockedSomeOne->type != 4);
        if ($decide) {
            $messages = new Messages();
            $messages->user1ID = $request->input('user1ID');
            $messages->user2ID = $request->input('user2ID');
            if ($messages->save()) {
                event(new PrivateChatSettingsEvent($messages->user1ID . "" . $messages->user2ID, "newMessageStarted"));
                return response()->json(['message' => 'Message Successfully Added'], 200);
            }
            return response()->json(['message' => 'Message Failed To Add'], 404);
        }
        return response()->json(['message' => "Message Can't Be Sent"], 400);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id, $userID)
    {
        return Messages::where('id', $id)->where('user1ID', $userID)->orWhere('user2ID', $userID);
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
        $messages = Messages::where('id', $id)->first();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $deleteMessage = Messages::where('id', $id)->first();
        if ($deleteMessage) {
            if (Auth::user()->id != $deleteMessage->user2ID && Auth::user()->id != $deleteMessage->user1ID) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
            event(new PrivateChatSettingsEvent($deleteMessage->user1ID . "" . $deleteMessage->user2ID, $deleteMessage, "deleteMessage"));
            $deleteMessage->delete();
            return response()->json(['message' => 'Message Deleted'], 200);
        }
        return response()->json(['message' => 'Message Not Found'], 404);
    }
}
