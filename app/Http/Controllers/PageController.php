<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\PagesHelper;
use App\Models\ProfilePic;
use App\Models\WallPaper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PageController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Page::all();
    }

    /**
     * > This function returns all the pages that have a name that is like the name that is passed in
     * 
     * @param name The name of the route
     * 
     * @return A collection of pages with the name of the page being passed in.
     */
    public function indexByName($name)
    {
        return Page::where('name', 'like', $name)->get();
    }
    /**
     * It validates the input, then checks if the email, phone, and url are valid, then saves the data
     * to the database.
     * 
     * @param Request request The request object.
     * 
     * @return The response is being returned as a JSON object.
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'required',
            'description' => 'required',
            'email' => 'nullable|email',
        ]);
        $phone = (!preg_match('/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/', $request->input('phone'))) ? null : $request->input('phone');
        $url = (!preg_match("/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/", $request->input('webURI'))) ? null : $request->input('webURI');
        $new = new Page();
        $new->name = $request->input('name');
        $new->description = $request->input('description');
        $new->webURI = $url;
        $new->phone = $phone;
        $new->email = $request->input('email');
        $new->place = $request->input('place');
        $new->businessType = $request->input('businessType');
        $new->businessHours = $request->input('businessHours');
        if ($new->save()) {
            return response()->json(['message' => 'Page Successfully Added', 'id' => $new->id], 200);
        }
        return response()->json(['message' => 'Page Failed To Add'], 404);
    }
    /**
     * It updates the profile picture of a page
     * 
     * @param id The id of the page
     * @param Request request The request object.
     * 
     * @return The response is a JSON object with a message and a status code.
     */
    public function editProfileID($id, Request $request)
    {
        $this->validate($request, [
            'actualProfilePicID' => 'required',
            'place' => 'required',
            'uid' => 'required'
        ]);
        if ($request->input('place') != "page") return response()->json(['message' => 'Wrong input Data'], 403);
        $actualProfilePicID = $request->input('actualProfilePicID');
        $Page = Page::where("id", $id)->first();
        $hasOwner = PagesHelper::where("rank", 3)->where('pageID', $id)->first();
        if ($hasOwner) {
            if (Auth::user()->id != $hasOwner->userID) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
        }
        if ($actualProfilePicID != 1) {
            $image = ProfilePic::where("place", $request->input('place'))->where("outsideID", $request->input('uid'))->where("id",  $actualProfilePicID)->first();
            if ($image && $Page) {
                $Page->actualProfilePicID = $actualProfilePicID;
                if ($Page->save()) {
                    return response()->json(['message' => 'Page Wallpaper Successfully Updated'], 200);
                }
                return response()->json(['message' => 'Page To Update'], 400);
            }
            return response()->json(['message' => 'Page To Update'], 401);
        } else {
            if ($Page) {
                $Page->actualProfilePicID = $actualProfilePicID;
                if ($Page->save()) {
                    return response()->json(['message' => 'Page ProfilePicture Successfully Updated'], 200);
                }
                return response()->json(['message' => 'Page To Update'], 400);
            }
            return response()->json(['message' => 'Page Not found'], 404);
        }
    }

    /**
     * It updates the wallpaper of a page
     * 
     * @param id The id of the page
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
        if ($request->input('place') != "page") return response()->json(['message' => 'Wrong input Data'], 403);
        $actualWallPaperID = $request->input('actualWallPaperID');
        $Page = Page::where("id", $id)->first();
        $hasOwner = PagesHelper::where("rank", 3)->where('pageID', $id)->first();
        if ($hasOwner) {
            if (Auth::user()->id != $hasOwner->userID) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
        }
        if ($actualWallPaperID != 1) {
            $image = WallPaper::where("place", $request->input('place'))->where("outsideID", $request->input('uid'))->where("id", $actualWallPaperID)->first();
            if ($image && $Page) {
                $Page->actualWallPaperID = $actualWallPaperID;
                if ($Page->save()) {
                    return response()->json(['message' => 'Page ProfileWallpaper Successfully Updated'], 200);
                }
                return response()->json(['message' => 'Page To Update'], 400);
            }
            return response()->json(['message' => 'Page Not found'], 404);
        } else {
            if ($Page) {
                $Page->actualWallPaperID = $actualWallPaperID;
                if ($Page->save()) {
                    return response()->json(['message' => 'Page ProfileWallpaper Successfully Updated'], 200);
                }
                return response()->json(['message' => 'Page To Update'], 400);
            }
            return response()->json(['message' => 'Page Not found'], 404);
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
        $Page = Page::where('id', $id)->first();
        if ($Page) {
            if (!isset($Page->actualWallPaperID) || $Page->actualWallPaperID == 1) {
                $Page->WallpaperURI = WallPaper::where("id", 1)->get(['WallPaperPicURI', 'id'])->first();
            } else {
                $Page->WallpaperURI = WallPaper::where("id", $Page->actualWallPaperID)->where("outsideID", $Page->id)->get(['WallPaperPicURI', 'id'])->first();
            }
            if (!isset($Page->actualProfilePicID) || $Page->actualProfilePicID == 1) {
                $Page->ProfilePicURI = ProfilePic::where("id", 1)->get(['profilePicURI', 'id'])->first();
            } else {
                $Page->ProfilePicURI = ProfilePic::where("id", $Page->actualProfilePicID)->where("outsideID", $Page->id)->get(['profilePicURI', 'id'])->first();
            }
            $Page->editable = PagesHelper::where('pageID', $id)->where('rank', '>=', 2)->where('rank', '<=', 3)->get(['userID']);
            $Page->count = PagesHelper::where('pageID', $id)->where('rank', '>=', 1)->where('rank', '<=', 3)->count();
        }
        return $Page;
    }

    /**
     * It updates a page's information
     * 
     * @param Request request The request object
     * @param id the id of the page
     * @param userID The user who is trying to update the page
     * 
     * @return The response is a JSON object with a message and a status code.
     */
    public function update(Request $request, $id, $userID)
    {
        $this->validate($request, [
            'name' => 'required',
            'description' => 'required'
        ]);
        $email = (!preg_match('/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/', $request->input('email'))) ? null : $request->input('email');
        $phone = (!preg_match('/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/', $request->input('phone'))) ? null : $request->input('phone');
        $url = (!preg_match("/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/", $request->input('webURI'))) ? null : $request->input('webURI');
        $new = Page::where('id', $id)->first();
        $hasOwner = PagesHelper::where("rank", 3)->where('pageID', $id)->first();
        if ($hasOwner) {
            if (Auth::user()->id != $hasOwner->userID) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
        }
        $canEdit = PagesHelper::where('pageID', $id)->where('userID', $userID)->where(function ($rank) {
            $rank->where('rank', 2)->orWhere('rank', 3);
        })->first();
        if ($canEdit) {
            $new->name = $request->input('name');
            $new->description = $request->input('description');
            $new->webURI = $url;
            $new->phone = $phone;
            $new->email = $email;
            $new->place = $request->input('place');
            $new->businessType = $request->input('businessType');
            $new->businessHours = ($request->input('businessHours') != "" || $request->input('businessHours') != "[]") ? $request->input('businessHours') : null;
            if ($new->save()) {
                return response()->json(['message' => 'Page Successfully Updates'], 200);
            }
            return response()->json(['message' => 'Page Failed To Update'], 404);
        }
        return response()->json(['message' => 'Page Failed To Update'], 404);
    }

    /**
     * It deletes a page if the user is the owner of the page
     * 
     * @param id The id of the page
     * @param owner The user who created the page
     * 
     * @return The response is being returned as a JSON object.
     */
    public function destroy($id, $owner)
    {
        $ownerUser = PagesHelper::where('pageID', $id)->where('rank', 3)->pluck('userID')->first();
        $delete = Page::where('id', $id)->first();
        $hasOwner = PagesHelper::where("rank", 3)->where('pageID', $id)->first();
        if ($hasOwner) {
            if (Auth::user()->id != $hasOwner->userID) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
        }
        if ($delete && $owner == $ownerUser) {
            $delete->delete();
            return response()->json(['message' => 'Page Deleted'], 200);
        }
        return response()->json(['message' => 'Page Did Not Deleted'], 404);
    }
}
