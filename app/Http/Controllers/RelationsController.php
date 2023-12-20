<?php

namespace App\Http\Controllers;

use App\Models\Relations;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\ProfilePic;
use App\Models\Messages;
use App\Events\PrivateChatSettingsEvent;
use App\Events\UserFrindsEvent;
use App\Events\AlertsEvent;
use Carbon\Carbon;

class RelationsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Relations::all()->toJson();
    }
    /**
     * It gets all the relations of a user, then gets all the messages of a user, then merges the two,
     * then gets the unique messages, then filters out the messages that are not in the range of -1 to
     * 4, then gets the name of the other user
     *
     * @param id the id of the user
     *
     * @return A collection of objects.
     */
    public function indexByUser($id)
    {
        $data = Relations::where(function ($query) use ($id) {
            $query->where('user1ID', $id)->orWhere('user2ID', $id);
        })->where('type', '<', 6)->where('type', '>', -1)->orderBy('type', 'DESC')->get(['user1ID', 'user2ID', 'type', 'who', 'id']);
        if($id!=Auth::user()->id){
            $data = Relations::where(function ($query) use ($id) {
            $query->where('user1ID', $id)->orWhere('user2ID', $id);
        })->where('type', '<', 6)->where('type', '>', 0)->orderBy('type', 'DESC')->get(['user1ID', 'user2ID', 'type', 'who', 'id']);
        }
        $data->map(function ($relation) {
            $exist = Messages::where(
                function ($query) use ($relation) {
                    $query->where('user1ID', $relation->user1ID)
                        ->orWhere('user1ID', $relation->user2ID);
                }
            )->orWhere(
                function ($query) use ($relation) {
                    $query->where('user2ID', $relation->user1ID)
                        ->orWhere('user2ID', $relation->user2ID);
                }
            )->first();
            if ($exist) {
            } else {
                $new = new Messages();
                $new->user1ID = $relation->user1ID;
                $new->user2ID = $relation->user2ID;
                $new->save();
            }
        });
        $allmessages = Messages::where(function ($query) use ($id) {
            $query->where('user1ID', $id)->orWhere('user2ID', $id);
        })->get();
        $data = $data->merge($allmessages);

        $data->map(function ($unique) use ($id) {
            $otherUserID = ($unique->user1ID == $id) ? $unique->user2ID : $unique->user1ID;
            $unique->unique = $id . ":" . $otherUserID;
        });
        $data = $data->unique('unique');

        $data = $data->filter(function ($item) {
            if (!isset($item->type) || $item->type > -1 && $item->type < 4) {
                return true;
            }
            return false;
        });
        $data->map(function ($user) use ($id) {
            $otherUserID = ($user->user1ID == $id) ? $user->user2ID : $user->user1ID;
            $selectedUser = User::where('id', $otherUserID)->first();
            $user->name = $selectedUser->firstName . " " . (($selectedUser->middleName) ? ($selectedUser->middleName . " ") : "") . $selectedUser->lastName;
        });
        return $data;
    }

    /**
     * It checks if the user is muted or not.
     *
     * @param id The user id of the user you want to check if they are muted or not.
     *
     * @return A boolean value.
     */
    public function isMuted($id)
    {
        $isMuted = Relations::where(function ($userIDs) use ($id) {
            $userIDs->where("user1ID", $id)->orWhere('user2ID', $id);
        })->where('type', 5)->first();
        if ($isMuted) {
            return true;
        } else {
            return false;
        }
    }

    /* Creating a new relation between two users. */
    public function store(Request $request)
    {
        $this->validate($request, [
            'user1ID' => 'required',
            'user2ID' => 'required',
            'who' => 'required',
            'type' => 'required'
        ]);
        if ($request->input('user1ID') == $request->input('user2ID')) return response()->json(['message' => 'users can not be the same!'], 400);
        if (Auth::user()->id != $request->input('user1ID') && $request->input('user2ID') != Auth::user()->id) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }


        $newRelation = new Relations;
        $newRelation->user1ID = $request->input('user1ID');
        $newRelation->user2ID = $request->input('user2ID');
        $newRelation->who = $request->input('who');
        $newRelation->type = $request->input('type');
        $notNew = Relations::where(function ($inRelation) use ($request) {
            $inRelation->where('user1ID', $request->input('user1ID'))->where('user2ID', $request->input('user2ID'));
        })->orWhere(function ($inRelation) use ($request) {
            $inRelation->where('user2ID', $request->input('user1ID'))->where('user1ID', $request->input('user2ID'));
        })->first();
        if (!$notNew && $newRelation->save() && ($newRelation->user2ID != $newRelation->user1ID) && (($request->input('user1ID') == $request->input('who')) || ($request->input('user2ID') == $request->input('who')))) {
            $otherUser = ($newRelation->who == $newRelation->user2ID) ? $newRelation->user1ID : $newRelation->user2ID;

            event(new UserFrindsEvent($otherUser, $newRelation, "newRelation"));
            event(new AlertsEvent(
                $otherUser,
                app('App\Http\Controllers\AlertsController')->create($otherUser, "{" . $newRelation->who . "} added you as a friend", "newRelation", Carbon::now()),
                "newRelation"
            ));

            $messages = Messages::where(function ($query) use ($newRelation) {
                $query->where('user1ID', $newRelation->user1ID)
                    ->where('user2ID', $newRelation->user2ID);
            })->orWhere(function ($query) use ($newRelation) {
                $query->where('user1ID', $newRelation->user2ID)
                    ->where('user2ID', $newRelation->user1ID);
            })->first();
            if ($messages) {
                event(new PrivateChatSettingsEvent($messages->user1ID . "" . $messages->user2ID, $newRelation, "newRelation"));
            }
            return $newRelation;
        }
        return response()->json(['message' => 'Relation Failed To Add'], 404);
    }

    /**
     * It returns the relationship between two users
     *
     * @param id The user who is logged in
     * @param id2 The user who is being blocked
     *
     * @return The return is a collection of objects.
     */
    public function show($id, $id2)
    {
        return Relations::where(function ($first) use ($id) {
            $first->where("user1ID", $id)->orWhere('user2ID', $id);
        })->where(function ($first) use ($id2) {
            $first->where("user1ID", $id2)->orWhere('user2ID', $id2);
        })->get();
    }
    public function blockeds($userID)
    {
        $blockeds = Relations::where("who", $userID)->where('type', 4)->where(function ($userIDs) use ($userID) {
            $userIDs->where("user1ID", $userID)->orWhere('user2ID', $userID);
        })->get();
        $blockeds->map(function ($user) use ($userID) {
            $blockedUser = ($user->user1ID == $userID) ? $user->user2ID : $user->user1ID;
            $selectedUser = User::where('id', $blockedUser)->first();
            $user->name = $selectedUser->firstName . " " . (($selectedUser->middleName) ? ($selectedUser->middleName . " ") : "") . $selectedUser->lastName;
            $profUrl = ProfilePic::where('id', $selectedUser->actualProfilePicID)->first();
            $user->profilePicURI = $profUrl->profilePicURI;
            $user->tag = $selectedUser->tag;
        });
        return $blockeds;
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
            'user1ID' => 'required',
            'user2ID' => 'required',
            'who' => 'required',
            'type' => 'required'
        ]);
        $Relation = Relations::where("id", $id)->first();
        if ($Relation && ($Relation->user2ID != $Relation->user1ID) && (($request->input('user1ID') == $request->input('who')) || ($request->input('user2ID') == $request->input('who')))) {

            if (Auth::user()->id != $request->input('user1ID') && $request->input('user2ID') != Auth::user()->id) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
            $Relation->user1ID = $request->input('user1ID');
            $Relation->user2ID = $request->input('user2ID');
            $Relation->who = $request->input('who');
            $Relation->type = $request->input('type');
            if ($Relation->save()) {
                $otherUser = ($Relation->who == $Relation->user2ID) ? $Relation->user1ID : $Relation->user2ID;
                event(new UserFrindsEvent($otherUser, "updatedRelation"));


                if ($Relation->type == 1) {
                    event(new AlertsEvent(
                        $otherUser,
                        app('App\Http\Controllers\AlertsController')->create($otherUser, "{" . $Relation->who . "} accepted the friend request", "Accepted", Carbon::now()),
                        "newRelation"
                    ));
                }
                $messages = Messages::where(function ($query) use ($Relation) {
                    $query->where('user1ID', $Relation->user1ID)
                        ->where('user2ID', $Relation->user2ID);
                })->orWhere(function ($query) use ($Relation) {
                    $query->where('user1ID', $Relation->user2ID)
                        ->where('user2ID', $Relation->user1ID);
                })->first();
                if ($messages) {
                    event(new PrivateChatSettingsEvent($messages->user1ID . "" . $messages->user2ID, $Relation, "updatedRelation"));
                }
                return response()->json(['message' => 'Relation Successfully Updated'], 200);
            }
            return response()->json(['message' => 'Relation To Update'], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id, $user1ID, $user2ID)
    {
        $deleteRelation = Relations::where('id', $id)->first();
        if ($deleteRelation) {
            if (Auth::user()->id != $deleteRelation->user1ID && $deleteRelation->user2ID != Auth::user()->id) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
            $messages = Messages::where(function ($query) use ($deleteRelation) {
                $query->where('user1ID', $deleteRelation->user1ID)
                    ->where('user2ID', $deleteRelation->user2ID);
            })->orWhere(function ($query) use ($deleteRelation) {
                $query->where('user1ID', $deleteRelation->user2ID)
                    ->where('user2ID', $deleteRelation->user1ID);
            })->first();
            if ($messages) {
                event(new PrivateChatSettingsEvent($messages->user1ID . "" . $messages->user2ID, $deleteRelation, "deletedRelation"));
            }
            $otherUser = ($deleteRelation->who == $deleteRelation->user2ID) ? $deleteRelation->user1ID : $deleteRelation->user2ID;
            event(new UserFrindsEvent($otherUser, "deletedRelation"));
            $deleteRelation->delete();
            return response()->json(['message' => 'Relation Deleted'], 200);
        }
        return response()->json(['message' => 'Relation Not Found'], 404);
    }
}
