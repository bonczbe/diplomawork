<?php

namespace App\Http\Controllers;

use App\Models\PersonalEmote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\Groupchathelper;

class PersonalEmoteController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return PersonalEmote::all();
    }
    /**
     * It returns all the personal emotes of a user
     * 
     * @param id The ID of the user you want to get the emotes of.
     * 
     * @return A collection of PersonalEmote objects.
     */
    public function indexByUser($id)
    {
        return PersonalEmote::where('user', $id)->get();
    }
    /**
     * It gets all the members of a groupchat, then for each member, it gets all the emotes that member
     * has, and adds them to the member object
     * 
     * @param id the id of the groupchat
     * 
     * @return A collection of Groupchathelper objects.
     */
    public function indexByGroup($id)
    {
        $helper = Groupchathelper::where('groupChatID', $id)->get();
        $helper->map(function ($member) {
            $emotes =  PersonalEmote::where('user', $member->userID)->get();
            $member->emotes = $emotes;
        });
        return $helper;
    }

    /**
     * It takes a request, validates it, and then saves the image to the database
     * 
     * @param Request request The request object
     * 
     * @return The response is a JSON object with a message and a status code.
     */

    public function store(Request $request)
    {
        $json = Storage::disk('local')->get('path.json');
        $paths = json_decode($json, true);
        $this->validate($request, [
            'user' => 'required',
            'name' => 'required',
            'image' => 'required|mimes:jpeg,jpg,png,gif,webm|max:2048',
        ]);
        if (Auth::user()->id != $request->input('user')) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        $new = new PersonalEmote;
        $new->user = $request->input('user');
        $new->name = $request->input('name');
        $file = $request->file('image');
        $imageName = DB::table('users')->where('id', $request->input('user'))->pluck('tag')[0] . '_' . time() . '_' . $file->getClientOriginalName();
        $file->storeAs('/public/images' . $paths['personal_emotes'], $imageName);
        $new->emoteURI = asset('/storage/images' . $paths['personal_emotes'] . '/' . $imageName);

        if ($new->save()) {
            return response()->json(['message' => 'PersonalEmote Successfully Added'], 200);
        }
        return response()->json(['message' => 'PersonalEmote Failed To Add'], 404);
    }

    /**
     * Display the specified resource.
     *
     * @param  name  $name
     * @return \Illuminate\Http\Response
     */
    public function show($name, $id)
    {
        return PersonalEmote::where('name', $name)->where('user', $id)->first();
    }
    /**
     * If the user is not logged in, return a 404 error. If the user is logged in, check if the emote
     * exists. If it does, check if the user is the owner of the emote. If they are, delete the emote.
     * If they aren't, return a 400 error. If the emote doesn't exist, return a 404 error
     * 
     * @param id The id of the personal emote you want to delete.
     * 
     * @return The response is a JSON object with a message and a status code.
     */
    public function destroy($id)
    {
        if (!Auth::check()) return response()->json(['message' => 'Permissoin denied access'], 404);
        $delete = PersonalEmote::where('id', $id)->first();
        if ($delete) {
            if (Auth::user()->id != $delete->user) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
            Storage::delete($delete->emoteURI);
            $delete->delete();
            return response()->json(['message' => 'PersonalEmote Deleted'], 200);
        }
        return response()->json(['message' => 'PersonalEmote Not Found'], 404);
    }
}
