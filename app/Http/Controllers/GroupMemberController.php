<?php

namespace App\Http\Controllers;

use App\Models\GroupMember;
use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GroupMemberController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return GroupMember::all();
    }
    /**
     * It returns all the groups that a user is a member of
     * 
     * @param id the id of the user
     * 
     * @return A collection of GroupMember objects.
     */
    public function indexByIDUser($id)
    {
        return GroupMember::where('memberID', $id)->get();
    }
    /**
     * It returns all the members of a group that have a rank of 3, 1, or 4.
     * 
     * @param id The group ID
     * 
     * @return A collection of users that are in the group with the id of .
     */
    public function Members($id)
    {
        $users = GroupMember::where('groupID', $id)->where(function ($ranks) {
            $ranks->where('rank', 3)->orWhere('rank', 1)->orWhere('rank', 4);
        })->get(['memberID', 'id']);
        return $users;
    }
    public function Requests($id)
    {
        $users = GroupMember::where('groupID', $id)->where('rank', 5)->get(['memberID', 'id']);
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
            'groupID' => 'required',
            'memberID' => 'required',
            'rank' => 'required'
        ]);
        $hasOwner = GroupMember::where("rank", 4)->where('groupID', $request->input('groupID'))->first();
        if ($hasOwner && $request->input('rank') == 4) {
            return response()->json(['message' => 'Group has owner!'], 500);
        }

        $has = GroupMember::where("memberID", $request->input('memberID'))->where('groupID', $request->input('groupID'))->first();
        if ($has) {
            $has->rank = $request->input('rank');
            if ($has->save()) {
                return response()->json(['message' => 'GroupMember Updated'], 200);
            }
            return response()->json(['message' => 'GroupMember Failed To Update'], 404);
        }
        $new = new GroupMember();
        $new->groupID = $request->input('groupID');
        $new->memberID = $request->input('memberID');
        $new->rank = $request->input('rank');
        if ($new->save()) {
            return response()->json(['message' => 'GroupMember Successfully Added'], 200);
        }
        return response()->json(['message' => 'GroupMember Failed To Add'], 404);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return GroupMember::where('id', $id)->first();
    }
    /**
     * > This function checks if the member is the owner of the group
     * 
     * @param groupID The ID of the group
     * @param memberID The ID of the member you want to check.
     * 
     * @return A boolean value.
     */
    public function isOwner($groupID, $memberID)
    {
        $isOwner = GroupMember::where('groupID', $groupID)->where('memberID', $memberID)->first();
        return ($isOwner && $isOwner->rank == 4);
    }
    /**
     * It checks if a user is a member of a group, and if so, what type of member they are
     * 
     * @param groupID the group id
     * @param memberID the user's ID
     */
    public function isMember($groupID, $memberID)
    {
        $isMember =  GroupMember::where('memberID', $memberID)->where('groupID', $groupID)->first();
        $data = json_decode("{}");
        if ($isMember && $isMember->rank > 0 && $isMember->rank < 5) {
            $data->id = $isMember->id;
            $data->type = 1;
            return $data;
        } else if ($isMember && $isMember->rank == 5) {
            $data->id = $isMember->id;
            $data->type = 2;
            return $data;
        } else if ($isMember && $isMember->rank == 6) {
            $data->id = $isMember->id;
            $data->type = 3;
            return $data;
        } else {
            $data->id = 0;
            $data->type = 0;
            return $data;
        };
    }

    /**
     * It checks if the user is a member of the group and if they are, it checks if they have a rank of
     * 1-4. If they do, it returns true, if not, it returns false
     * 
     * @param groupID The ID of the group you want to check.
     * @param id The user's id
     * 
     * @return A boolean value.
     */
    public function canPost($groupID, $id)
    {
        $can = GroupMember::where("groupID", $groupID)->where("memberID", $id)->first();
        if ($can) {
            if ($can->rank > 0 && $can->rank < 5) {
                return true;
            }
            return false;
        } else {
            return response()->json(['message' => 'GroupMember Failed To Add'], 404);
        }
    }
    /**
     * If the user is a member of the group and the group is public, return true
     * 
     * @param groupID The ID of the group you want to check.
     * @param id The id of the user
     * 
     * @return A boolean value.
     */
    public function canSee($groupID, $id)
    {
        $member = GroupMember::where("groupID", $groupID)->where("memberID", $id)->first();
        if ($member) {
            $group = Group::find($groupID);
            if ($member->rank > 0 && $member->rank < 5 && $group && $group->status == false) {
                return true;
            } else if ($group && $group->status == true) {
                return true;
            }
            return false;
        } else {
            return response()->json(['message' => 'GroupMember Failed To Add'], 404);
        }
    }

    /**
     * It checks if the user is a member of the group, and if so, it returns the rank of the user
     * 
     * @param groupID The ID of the group
     * @param UserID The user's ID
     * 
     * @return The relation between the user and the group.
     */
    public function relation($groupID, $UserID)
    {
        $relation =  GroupMember::where('memberID', $UserID)->where('groupID', $groupID)->first();
        if ($relation) {
            if ($relation->rank > 2 && $relation->rank < 5) {
                return $relation->rank;
            } else {
                return 0;
            }
        }
        return response()->json(['message' => 'Relation not found'], 404);
    }

    /**
     * It returns all the members of a group that have a rank of 3 or 4.
     * 
     * @param id The group ID
     * 
     * @return A collection of GroupMember objects.
     */
    public function admins($id)
    {
        return GroupMember::where('groupID', $id)->where(function ($ranks) {
            $ranks->where('rank', 3)->orWhere('rank', 4);
        })->get(['memberID AS userID', 'rank', 'id']);
    }

    /**
     * It returns all the users that are blocked from a group.
     * 
     * @param id the id of the event
     * 
     * @return A collection of objects.
     */
    public function blockedUsers($id)
    {
        $blokeds = DB::table('group_members')
            ->join('users', 'users.id', 'group_members.memberID')
            ->join('profile_pics', 'users.actualProfilePicID', 'profile_pics.id')
            ->where('group_members.groupID', $id)
            ->where('group_members.rank', 6)
            ->select('profile_pics.profilePicURI AS ProfilPictureURI', 'group_members.memberID AS userID', 'group_members.rank AS rank', 'group_members.id AS id', 'users.tag AS tag', 'users.firstName AS firstName', 'users.middleName AS middleName', 'users.lastName AS lastName')
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
            'rank' => 'required',
            'groupID' => 'required'
        ]);
        $hasOwner = GroupMember::where("rank", 4)->where('groupID', $request->input('groupID'))->first();

        if ($hasOwner && $request->input('rank') == 4) {
            return response()->json(['message' => 'Group has owner!'], 500);
        }
        $new = GroupMember::where("id", $id)->first();
        $new->rank = $request->input('rank');
        if ($new->save()) {
            return response()->json(['message' => 'GroupMember Successfully Updated'], 200);
        }
        return response()->json(['message' => 'GroupMember Failed To Update'], 404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $delete = GroupMember::where('id', $id)->first();
        if ($delete) {
            $delete->delete();
            return response()->json(['message' => 'GroupMember Deleted'], 200);
        }
        return response()->json(['message' => 'GroupMember Not Found'], 404);
    }
}
