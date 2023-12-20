<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EventsHelper;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EventHelperController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return EventsHelper::all();
    }
    public function indexByEvent($id)
    {
        return EventsHelper::where('eventID', $id)->get();
    }
    public function indexByUser($id)
    {
        return EventsHelper::where('userID', $id)->get();
    }
    public function Members($id)
    {
        $users = EventsHelper::where('eventID', $id)->where(function ($roles) {
            $roles->where('role', 2)->orWhere('role', 3)->orWhere('role', 1)->orWhere('role', 4)->orWhere('role', 0);
        })->get(['userID', 'id', 'role']);
        return $users;
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
            'eventID' => 'required',
            'userID' => 'required',
            'role' => 'required'
        ]);
        $hasOwner = EventsHelper::where("role", 0)->where('eventID', $request->input('eventID'))->first();
        if ($hasOwner && $request->input('role') == 0) {
            return response()->json(['message' => 'Event has owner!'], 500);
        }
        $has = EventsHelper::where("userID", $request->input('userID'))->where('eventID', $request->input('eventID'))->first();
        if ($has) {
            $has->role = $request->input('role');
            if ($has->save()) {
                return response()->json(['message' => 'EventHelper Updated'], 200);
            }
            return response()->json(['message' => 'EventHelper Failed To Update'], 404);
        }
        $new = new EventsHelper();
        $new->eventID = $request->input('eventID');
        $new->userID = $request->input('userID');
        $new->role = $request->input('role');
        if ($new->save()) {
            $new;
        }
        return response()->json(['message' => 'EventHelper Failed To Add'], 404);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return EventsHelper::where('id', $id)->get();
    }
    /**
     * It checks if the user is the owner of the event
     * 
     * @param eventID The ID of the event
     * @param userID The user's ID
     * 
     * @return A boolean value.
     */
    public function isOwner($eventID, $userID)
    {
        $isOwner = EventsHelper::where('eventID', $eventID)->where('userID', $userID)->first();
        return ($isOwner && $isOwner->role == 0);
    }
    /**
     * It checks if a user is a member of an event, and if so, what type of member they are
     * 
     * @param eventID The ID of the event
     * @param userID The user's ID
     * 
     * @return An object with two properties: id and type.
     */
    public function isMember($eventID, $userID)
    {
        $isMember =  EventsHelper::where('userID', $userID)->where('eventID', $eventID)->first();
        $data = json_decode("{}");
        if ($isMember && $isMember->role >= 0 && $isMember->role < 3) {
            $data->id = $isMember->id;
            $data->type = 1; //Will be
            return $data;
        } else if ($isMember && $isMember->role == 3) {
            $data->id = $isMember->id;
            $data->type = 2; //Might be
            return $data;
        } else if ($isMember && $isMember->role == 4) {
            $data->id = $isMember->id;
            $data->type = 3; //won't be
            return $data;
        } else if ($isMember && $isMember->role == 5) {
            $data->id = $isMember->id;
            $data->type = 4; //blocked
            return $data;
        } else {
            $data->id = 0;
            $data->type = 0;
            return $data;
        };
    }

    /**
     * It returns the role of the user in the event
     * 
     * @param eventID The ID of the event
     * @param UserID The ID of the user you want to check the relation for.
     * 
     * @return The relation between the user and the event.
     */
    public function relation($eventID, $UserID)
    {
        $relation =  EventsHelper::where('userID', $UserID)->where('eventID', $eventID)->first();
        if ($relation) {
            if ($relation->role > -1 && $relation->role < 5) {
                return $relation->role;
            } else {
                return 0;
            }
        }
        return response()->json(['message' => 'Relation not found'], 404);
    }

    /**
     * It returns all the users who are admins or owners of an event.
     * 
     * @param id The event ID
     * 
     * @return A collection of objects.
     */
    public function admins($id)
    {
        return EventsHelper::where('eventID', $id)->where(function ($ranks) {
            $ranks->where('role', 1)->orWhere('role', 0);
        })->get(['userID', 'role AS rank', 'id']);
    }


    /**
     * It returns a list of users that are blocked from an event.
     * 
     * @param id The event ID
     */
    public function blockedUsers($id)
    {
        $blokeds = DB::table('events_helpers')
            ->join('users', 'users.id', 'events_helpers.userID')
            ->join('profile_pics', 'users.actualProfilePicID', 'profile_pics.id')
            ->where('events_helpers.eventID', $id)
            ->where('events_helpers.role', 5)
            ->select('profile_pics.profilePicURI AS ProfilPictureURI', 'events_helpers.userID AS userID', 'events_helpers.role AS rank', 'events_helpers.id AS id', 'users.tag AS tag', 'users.firstName AS firstName', 'users.middleName AS middleName', 'users.lastName AS lastName')
            ->get();
        return $blokeds;
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
            'userID' => 'required',
            'eventID' => 'required'
        ]);
        $hasOwner = EventsHelper::where("role", 0)->where('eventID', $request->input('eventID'))->first();
        if ($hasOwner && $request->input('role') == 0) {
            return response()->json(['message' => 'Event has owner!'], 500);
        }
        $new = EventsHelper::where("eventID", $request->input('eventID'))->where("userID", $request->input('userID'))->first();
        $new->role = $request->input('role');
        if ($new->save()) {
            return response()->json(['message' => 'EventHelper Successfully Updated'], 200);
        }
        return response()->json(['message' => 'EventHelper Failed To Update'], 404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $delete = EventsHelper::where('id', $id)->first();
        if ($delete) {
            $delete->delete();
            return response()->json(['message' => 'EventHelper Deleted'], 200);
        }
        return response()->json(['message' => 'EventHelper Not Found'], 404);
    }
}
