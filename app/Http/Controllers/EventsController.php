<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Events;
use App\Models\EventsHelper;
use App\Models\ProfilePic;
use App\Models\WallPaper;
use Illuminate\Support\Facades\Auth;

class EventsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Events::all()->paginate(15)->get();
    }
    /**
     * It takes a name as a parameter and returns a paginated list of events with that name
     * 
     * @param Request request The request object.
     * 
     * @return A collection of events.
     */
    public function indexByName(Request $request)
    {
        $this->validate($request, [
            'name' => 'required',
        ]);
        return Events::where('name', 'like', '%' . $request->input('name') . '%')->get();
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
            'description' => 'required',
            'startDate' => 'required|date',
            'endDate' => 'required|date'
        ]);
        $url = (!preg_match("/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/", $request->input('pageURL'))) ? null : $request->input('pageURL');
        $new = new Events;
        $new->name = $request->input('name');
        $new->description = $request->input('description');
        $new->place = $request->input('place');
        $new->pageURL = $url;
        $new->startDate = $request->input('startDate');
        $new->endDate = $request->input('endDate');
        if ($new->save()) {
            return response()->json(['message' => 'Event Successfully Added', 'id' => $new->id], 200);
        }
        return response()->json(['message' => 'Event Failed To Add'], 404);
    }
    /**
     * It updates the profile picture of an event.
     * </code>
     * 
     * @param id The id of the event
     * @param Request request The request object.
     */
    public function editProfileID($id, Request $request)
    {
        $this->validate($request, [
            'actualProfilePicID' => 'required',
            'place' => 'required',
            'uid' => 'required'
        ]);
        $isAdmin = EventsHelper::where("userID", Auth::user()->id)->where('role', '0')->first();
        if ($isAdmin) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        if ($request->input('place') != "event") return response()->json(['message' => 'Wrong input Data'], 403);
        $actualProfilePicID = $request->input('actualProfilePicID');
        $Events = Events::where("id", $id)->first();
        if ($actualProfilePicID != 1) {
            $image = WallPaper::where("place", $request->input('place'))->where("outsideID", $request->input('uid'))->where("id", $actualProfilePicID)->first();
            if ($image && $Events) {
                $Events->actualProfilePicID = $actualProfilePicID;
                if ($Events->save()) {
                    return response()->json(['message' => 'Event ProfilePicture Successfully Updated'], 200);
                }
                return response()->json(['message' => 'Event To Update'], 400);
            }
            return response()->json(['message' => 'Event To Update'], 401);
        } else {
            if ($Events) {
                $Events->actualProfilePicID = $actualProfilePicID;
                if ($Events->save()) {
                    return response()->json(['message' => 'Event ProfilePicture Successfully Updated'], 200);
                }
                return response()->json(['message' => 'Event To Update'], 400);
            }
            return response()->json(['message' => 'Event Not found'], 404);
        }
    }

    /**
     * It's a function that allows you to change the wallpaper of an event
     * 
     * @param id The id of the event
     * @param Request request The request object.
     */
    public function editWallpaperID($id, Request $request)
    {
        $this->validate($request, [
            'actualWallPaperID' => 'required',
            'place' => 'required',
            'uid' => 'required'
        ]);

        $isAdmin = EventsHelper::where("userID", Auth::user()->id)->where('role', '0')->first();
        if ($isAdmin) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        if ($request->input('place') != "event") return response()->json(['message' => 'Wrong input Data'], 403);
        $actualWallPaperID = $request->input('actualWallPaperID');
        $Events = Events::where("id", $id)->first();
        if ($actualWallPaperID != 1) {
            $image = WallPaper::where("place", $request->input('place'))->where("outsideID", $request->input('uid'))->where("id", $actualWallPaperID)->first();
            if ($image && $Events) {
                $Events->actualWallPaperID = $actualWallPaperID;
                if ($Events->save()) {
                    return response()->json(['message' => 'Event ProfileWallpaper Successfully Updated'], 200);
                }
                return response()->json(['message' => 'Event To Update'], 400);
            }
            return response()->json(['message' => 'Event Not found'], 404);
        } else {
            if ($Events) {
                $Events->actualWallPaperID = $actualWallPaperID;
                if ($Events->save()) {
                    return response()->json(['message' => 'Event ProfileWallpaper Successfully Updated'], 200);
                }
                return response()->json(['message' => 'Event To Update'], 400);
            }
            return response()->json(['message' => 'Event Not found'], 404);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $Event = Events::where('id', $id)->first();

        if ($Event) {
            if (!isset($Event->actualWallPaperID) || $Event->actualWallPaperID == 1) {
                $Event->WallpaperURI = WallPaper::where("id", 1)->get(['WallPaperPicURI', 'id'])->first();
            } else {
                $Event->WallpaperURI = WallPaper::where("id", $Event->actualWallPaperID)->where("outsideID", $Event->id)->get(['WallPaperPicURI', 'id'])->first();
            }
            if (!isset($Event->actualProfileID) || $Event->actualProfileID == 1) {
                $Event->ProfilePicURI = ProfilePic::where("id", 1)->get(['profilePicURI', 'id'])->first();
            } else {
                $Event->ProfilePicURI = ProfilePic::where("id", $Event->actualProfilePicID)->where("outsideID", $Event->id)->get(['profilePicURI', 'id'])->first();
            }
            $Event->editable = EventsHelper::where('eventID', $id)->where(function ($ranks) {
                $ranks->where('role', 0)->orWhere('role', 1);
            })->get(['userID']);
            $Event->count = EventsHelper::where('eventID', $id)->where('role', '>=', 0)->where('role', '<=', 4)->count();
            $Event->willBe = EventsHelper::where('eventID', $id)->where('role', '>=', 0)->where('role', '<=', 2)->count();
            $Event->mightBe = EventsHelper::where('eventID', $id)->where('role', 3)->count();
            $Event->wont = EventsHelper::where('eventID', $id)->where('role', 4)->count();
        }
        return $Event;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id, $userID)
    {
        $this->validate($request, [
            'name' => 'required',
            'description' => 'required',
            'startDate' => 'required|date',
            'endDate' => 'required|date'
        ]);
        $isAdmin = EventsHelper::where("userID", Auth::user()->id)->where(function ($ranks) {
            $ranks->where('role', 0)->orWhere('role', 1);
        })->first();
        if (!$isAdmin) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        $url = (!preg_match("/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/", $request->input('pageURL'))) ? null : $request->input('pageURL');
        $new = Events::where("id", $id)->first();
        $canEdit = EventsHelper::where('eventID', $id)->where('userID', $userID)->where(function ($rank) {
            $rank->where('role', 0)->orWhere('role', 1);
        })->first();
        if ($canEdit) {
            $new->name = $request->input('name');
            $new->description = $request->input('description');
            $new->pageURL = $url;
            $new->startDate = $request->input('startDate');
            $new->endDate = $request->input('endDate');
            $new->place = $request->input('place');
            if ($new->save()) {
                return response()->json(['message' => 'Event Successfully Updated'], 200);
            }
            return response()->json(['message' => 'Event Failed To Update'], 404);
        }
        return response()->json(['message' => 'Event Failed To Update'], 404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id, $owner)
    {
        $delete = Events::where('id', $id)->first();
        $ownerUser = EventsHelper::where('eventID', $id)->where('role', 0)->pluck('userID')->first();
        if ($delete && $owner == $ownerUser) {
            $isAdmin = EventsHelper::where("userID", Auth::user()->id)->where('role', '0')->first();
            if ($isAdmin) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
            $delete->delete();
            return response()->json(['message' => 'Event Deleted'], 200);
        }
        return response()->json(['message' => 'Event Not Found'], 404);
    }
}
