<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupPosts;
use Illuminate\Http\Request;
use App\Models\GroupMember;
use App\Models\ProfilePic;
use App\Models\WallPaper;
use Illuminate\Support\Facades\Auth;

class GroupController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Group::all();
    }
    /**
     * It returns all the groups where the name is like the name passed in
     * 
     * @param name The name of the route
     * 
     * @return A collection of groups where the name is like the name passed in.
     */
    public function indexByName($name)
    {
        return Group::where('name', 'Like', '%' . $name . '%')->get();;
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
            'description' => 'required'
        ]);
        $new = new Group();
        $new->name = $request->input('name');
        $new->description = $request->input('description');
        $new->status = (!$request->input('status')) ? false : $request->input('status');
        ($request->input('status')) ? $new->status = $request->input('status') : null;
        if ($new->save()) {
            return response()->json(['message' => 'Group Successfully Added', 'id' => $new->id], 200);
        }
        return response()->json(['message' => 'Group Failed To Add'], 404);
    }

    /**
     * It updates the profile picture of a group
     * 
     * @param id The id of the group
     * @param Request request The request object.
     * 
     * @return The response is being returned as a JSON object.
     */
    public function editProfileID($id, Request $request)
    {
        $this->validate($request, [
            'actualProfilePicID' => 'required',
            'place' => 'required',
            'uid' => 'required'
        ]);
        $hasOwner = GroupMember::where("rank", 4)->where('groupID', $id)->first();
        if ($hasOwner) {
            if (Auth::user()->id != $hasOwner->memberID) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
        }
        if ($request->input('place') != "group") return response()->json(['message' => 'Wrong input Data'], 403);
        $actualProfilePicID = $request->input('actualProfilePicID');
        $Group = Group::where("id", $id)->first();
        if ($actualProfilePicID != 1) {
            $image = ProfilePic::where("place", $request->input('place'))->where("outsideID", $request->input('uid'))->where("id",  $actualProfilePicID)->first();
            if ($image && $Group) {
                $Group->actualProfileID = $actualProfilePicID;
                if ($Group->save()) {
                    return response()->json(['message' => 'Group ProfilePicture Successfully Updated'], 200);
                }
                return response()->json(['message' => 'Group To Update'], 400);
            }
            return response()->json(['message' => 'Group Not found'], 404);
        } else {
            if ($Group) {
                $Group->actualProfileID = $actualProfilePicID;
                if ($Group->save()) {
                    return response()->json(['message' => 'Group ProfilePicture Successfully Updated'], 200);
                }
                return response()->json(['message' => 'Group To Update'], 400);
            }
            return response()->json(['message' => 'Group Not found'], 404);
        }
    }

    /**
     * It updates the wallpaper of a group.
     * </code>
     * 
     * @param id The id of the group
     * @param Request request The request object.
     * 
     * @return The response is being returned as a JSON object.
     */
    public function editWallpaperID($id, Request $request)
    {
        $this->validate($request, [
            'actualWallPaperID' => 'required',
            'place' => 'required',
            'uid' => 'required'
        ]);
        $hasOwner = GroupMember::where("rank", 4)->where('groupID', $id)->first();
        if ($hasOwner) {
            if (Auth::user()->id != $hasOwner->memberID) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
        }
        if ($request->input('place') != "group") return response()->json(['message' => 'Wrong input Data'], 403);
        $actualWallPaperID = $request->input('actualWallPaperID');
        $Group = Group::where("id", $id)->first();
        if ($actualWallPaperID != 1) {
            $image = WallPaper::where("place", $request->input('place'))->where("outsideID", $request->input('uid'))->where("id", $actualWallPaperID)->first();
            if ($image && $Group) {
                $Group->actualWallPaperID = $actualWallPaperID;
                if ($Group->save()) {
                    return response()->json(['message' => 'Group ProfileWallpaper Successfully Updated'], 200);
                }
                return response()->json(['message' => 'Group To Update'], 400);
            }
            return response()->json(['message' => 'Group Not found'], 404);
        } else {
            if ($Group) {
                $Group->actualWallPaperID = $actualWallPaperID;
                if ($Group->save()) {
                    return response()->json(['message' => 'Group ProfileWallpaper Successfully Updated'], 200);
                }
                return response()->json(['message' => 'Group To Update'], 400);
            }
            return response()->json(['message' => 'Group Not found'], 404);
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
        $Group = Group::where('id', $id)->first();
        if ($Group) {
            if (!isset($Group->actualWallPaperID) || $Group->actualWallPaperID == 1) {
                $Group->WallpaperURI = WallPaper::where("id", 1)->get(['WallPaperPicURI', 'id'])->first();
            } else {
                $Group->WallpaperURI = WallPaper::where("id", $Group->actualWallPaperID)->where("outsideID", $Group->id)->get(['WallPaperPicURI', 'id'])->first();
            }

            if (!isset($Group->actualProfileID) || $Group->actualProfileID == 1) {
                $Group->ProfilePicURI = ProfilePic::where("id", 1)->get(['profilePicURI', 'id'])->first();
            } else {
                $Group->ProfilePicURI = ProfilePic::where("id", $Group->actualProfileID)->where("outsideID", $Group->id)->get(['profilePicURI', 'id'])->first();
            }

            $Group->editable = GroupMember::where('groupID', $id)->where('rank', '>=', 2)->where('rank', '<=', 4)->get(['memberID']);
            $Group->count = GroupMember::where('groupID', $id)->where('rank', '>=', 1)->where('rank', '<=', 4)->count();
        }
        return $Group;
    }

    /**
     * It checks if the user can see the post, and if the group is private or not.
     * 
     * @param id The id of the post
     * @param userID The user's ID
     */
    public function getFromPost($id, $userID)
    {
        $ifWork = json_decode("{}");
        $Post = GroupPosts::findOrFail($id);
        if ($Post) {
            $Group = Group::findOrFail($Post->groupID);
            if ($Group) {
                $member = GroupMember::where("groupID", $Post->groupID)->where("memberID", $userID)->first();
                if ($member) {
                    $ifWork->canSee = ($member->rank > 0 && $member->rank < 5);
                    $ifWork->isPrivate = $Group->status == false;
                    return $ifWork;
                } else if ($Group->status == true) {
                    $ifWork->canSee = true;
                    $ifWork->isPrivate = false;
                    return $ifWork;
                }
                return response()->json(['message' => 'Member not found'], 404);
            }
            return response()->json(['message' => 'Group Not Found'], 404);
        }
        return response()->json(['message' => 'Post Not Found'], 404);
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
            'status' => 'required',
        ]);
        $new = Group::where('id', $id)->first();
        $hasOwner = GroupMember::where("rank", 4)->where('groupID', $id)->first();
        if ($hasOwner) {
            if (Auth::user()->id != $hasOwner->memberID) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
        }
        $canEdit = GroupMember::where('groupID', $id)->where('memberID', $userID)->where(function ($rank) {
            $rank->where('rank', 4)->orWhere('rank', 3);
        })->first();
        if ($canEdit) {
            $new->name = $request->input('name');
            $new->description = $request->input('description');
            $new->status = $request->input('status');
            if ($new->save()) {
                return response()->json(['message' => 'Group Successfully Updates'], 200);
            }
            return response()->json(['message' => 'Group Failed To Update'], 404);
        }
        return response()->json(['message' => 'Group Failed To Update'], 404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id, $owner)
    {
        $ownerId = GroupMember::where('groupID', $id)->where('rank', 4)->pluck('memberID')->first();
        $delete = Group::where('id', $id)->first();
        if ($delete && $owner == $ownerId) {
            if (Auth::user()->id != $ownerId->memberID) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
            $delete->delete();
            return response()->json(['message' => 'Page Deleted'], 200);
        }
        return response()->json(['message' => 'Page Did Not Deleted'], 404);
    }
}
