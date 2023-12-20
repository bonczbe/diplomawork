<?php

namespace App\Http\Controllers;

use App\Models\PagesHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PagesHelperController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return PagesHelper::all();
    }
    /**
     * It returns all the pages that belong to a user
     * 
     * @param id The id of the user
     * 
     * @return A collection of PagesHelper objects.
     */
    public function indexByUser($id)
    {
        return PagesHelper::where('userID', $id)->get();
    }
    /**
     * It returns all the users who are following a page
     * 
     * @param id The page id
     * 
     * @return A collection of users that are following the page.
     */
    public function Followers($id)
    {
        $users = PagesHelper::where('pageID', $id)->where(function ($ranks) {
            $ranks->where('rank', 2)->orWhere('rank', 3)->orWhere('rank', 1);
        })->get(['userID', 'id']);
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
            'userID' => 'required',
            'pageID' => 'required',
            'rank' => 'required',
        ]);
        $hasOwner = PagesHelper::where("rank", 3)->where('pageID', $request->input('pageID'))->first();
        if ($hasOwner && $request->input('rank') == 3) {
            return response()->json(['message' => 'Page has owner!'], 500);
        }
        $has = PagesHelper::where("userID", $request->input('userID'))->where('pageID', $request->input('pageID'))->first();
        if ($has) {
            $has->rank = $request->input('rank');
            if ($has->save()) {
                return response()->json(['message' => 'PagesHelper Updated'], 200);
            }
            return response()->json(['message' => 'PagesHelper Failed To Update'], 404);
        }
        $new = new PagesHelper;
        $new->userID = $request->input('userID');
        $new->pageID = $request->input('pageID');
        $new->rank = $request->input('rank');
        if ($new->save()) {
            return response()->json(['message' => 'PagesHelper Successfully Added', 'id' => $new->id], 200);
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
        return PagesHelper::where('id', $id)->first();
    }
    /**
     * It checks if the user is the owner of the page
     * 
     * @param pageID The ID of the page you want to check
     * @param userID The user's ID
     * 
     * @return A boolean value.
     */
    public function isOwner($pageID, $userID)
    {
        $isOwner = PagesHelper::where('pageID', $pageID)->where('userID', $userID)->first();
        return ($isOwner && $isOwner->rank == 3);
    }
    /**
     * It checks if a user has liked a page, and if so, it returns the id of the like and the type of
     * like
     * 
     * @param pageID The ID of the page you want to check
     * @param userID The user's ID
     */
    public function isLiked($pageID, $userID)
    {
        $isLiked =  PagesHelper::where('userID', $userID)->where('pageID', $pageID)->first();
        $data = json_decode("{}");
        if ($isLiked && $isLiked->rank > 0 && $isLiked->rank < 4) {
            $data->id = $isLiked->id;
            $data->type = 1;
            return $data;
        } else if ($isLiked && $isLiked->rank == 4) {
            $data->id = $isLiked->id;
            $data->type = 2;
            return $data;
        } else {
            $data->id = 0;
            $data->type = 0;
            return $data;
        };
    }
    /**
     * It returns the rank of the user in the page
     * 
     * @param pageID The ID of the page you want to check the relation of.
     * @param UserID The ID of the user who is trying to access the page.
     * 
     * @return the rank of the user in the page.
     */
    public function relation($pageID, $UserID)
    {
        $relation =  PagesHelper::where('userID', $UserID)->where('pageID', $pageID)->first();
        if ($relation) {
            if ($relation->rank > 1 && $relation->rank < 4) {
                return $relation->rank;
            } else {
                return 0;
            }
        }
        return response()->json(['message' => 'Relation not found'], 404);
    }

    /**
     * It returns all the users who are admins or moderators of a page.
     * 
     * @param id The page ID
     * 
     * @return A collection of objects.
     */
    public function admins($id)
    {
        return PagesHelper::where('pageID', $id)->where(function ($ranks) {
            $ranks->where('rank', 2)->orWhere('rank', 3);
        })->get(['userID', 'rank', 'id']);
    }


    /**
     * It returns all the users that are blocked by the page.
     * 
     * @param id The id of the page
     * 
     * @return A collection of objects.
     */
    public function blockedUsers($id)
    {
        $blokeds = DB::table('pages_helpers')
            ->join('users', 'users.id', 'pages_helpers.userID')
            ->join('profile_pics', 'users.actualProfilePicID', 'profile_pics.id')
            ->where('pages_helpers.pageID', $id)
            ->where('pages_helpers.rank', 4)
            ->select('profile_pics.profilePicURI AS ProfilPictureURI', 'pages_helpers.userID AS userID', 'pages_helpers.rank AS rank', 'pages_helpers.id AS id', 'users.tag AS tag', 'users.firstName AS firstName', 'users.middleName AS middleName', 'users.lastName AS lastName')
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
            'pageID' => 'required'
        ]);
        $hasOwner = PagesHelper::where("rank", 3)->where('pageID', $request->input('pageID'))->first();
        if ($hasOwner && $request->input('rank') == 3) {
            return response()->json(['message' => 'Page has owner!'], 500);
        }

        $new = PagesHelper::where("id", $id)->first();
        $new->rank = $request->input('rank');
        if ($new->save()) {
            return response()->json(['message' => 'PagesHelper Successfully Updated'], 200);
        }
        return response()->json(['message' => 'PagesHelper Failed To Update'], 404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $delete = PagesHelper::where('id', $id)->first();
        if ($delete) {
            $delete->delete();
            return response()->json(['message' => 'Groupchathelper Deleted'], 200);
        }
        return response()->json(['message' => 'Groupchathelper Not Found'], 404);
    }
}
