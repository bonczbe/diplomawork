<?php

namespace App\Http\Controllers;

use App\Models\Groupmessage;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Events\GroupChatOnlineEvent;


class GroupMessageController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Groupmessage::all();
    }
    /**
     * It returns all the messages from a group chat, ordered by date, in descending order
     * 
     * @param id the id of the group chat
     * 
     * @return A collection of Groupmessage objects.
     */
    public function indexByGroupChatId($id)
    {
        return Groupmessage::where('groupChatID', $id)->orderBy('date', 'DESC')->get();
    }
    /**
     * It returns all the messages from a group chat that are images, ordered by date
     * 
     * @param id the id of the group chat
     * 
     * @return A collection of Groupmessage objects.
     */
    public function indexByGroupChatIDImages($id)
    {
        return Groupmessage::where('groupChatID', $id)->where('isFile', true)->orderBy('date', 'DESC')->get();
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
            'groupChatID' => 'required',
            'textURI' => 'required'
        ]);
        if (Auth::user()->id != $request->input('userID')) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        $json = Storage::disk('local')->get('path.json');
        $paths = json_decode($json, true);

        $new = new Groupmessage;
        $new->userID = $request->input('userID');
        $new->groupChatID = $request->input('groupChatID');
        $new->date = Carbon::now();
        $new->isFile = false;
        if ($request->file('textURI')) {
            $file = $request->file('textURI');
            $fileOriginalNAme = $file->getClientOriginalName();
            if (
                Str::endsWith($fileOriginalNAme, 'jpeg') || Str::endsWith($fileOriginalNAme, 'png') ||
                Str::endsWith($fileOriginalNAme, 'jpg') || Str::endsWith($fileOriginalNAme, 'gif') ||
                Str::endsWith($fileOriginalNAme, 'mp4') || Str::endsWith($fileOriginalNAme, 'ogv') ||
                Str::endsWith($fileOriginalNAme, 'ogg') || Str::endsWith($fileOriginalNAme, 'webm')
            ) {
                $fileName = DB::table('users')->where('id', $request->input('userID'))->pluck('tag')[0] . '_' . time() . '_' . $fileOriginalNAme;
                $new->isFile = true;
                $file->storeAs('/public/images' . $paths['groupmessages'], $fileName);
                $new->textURI = asset('/storage/images' . $paths['groupmessages'] . '/' . $fileName);
            } else {
                return response()->json(['message' => 'File format not supported!'], 500);
            }
        } else if ($request->input('textURI') != "") {
            $new->textURI = $request->input('textURI');
        } else {
            return response()->json(['message' => 'GroupChatMesage text Not Found or empty'], 404);
        }
        if ($new->save()) {
            if($request->file('textURI')){
                event(new GroupChatOnlineEvent($new->groupChatID, $new, "newImage"));
            }
            event(new GroupChatOnlineEvent($new->groupChatID, $new, "newMessage"));
            return response()->json($new, 200);
        }
        return response()->json(['message' => 'GroupChatMesage Failed To Add'], 404);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Groupmessage::where('id', $id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $deleteMessagesData = Groupmessage::where('id', $id)->first();
        if ($deleteMessagesData) {
            if ($deleteMessagesData->isFile) {
                Storage::delete($deleteMessagesData->textURI);
                event(new GroupChatOnlineEvent($deleteMessagesData->groupChatID, $deleteMessagesData, "removeImage"));
            }
            event(new GroupChatOnlineEvent($deleteMessagesData->groupChatID, $deleteMessagesData, "destroyMessage"));
            $deleteMessagesData->delete();
            return response()->json(['message' => 'GroupChatMesage Deleted'], 200);
        }
        return response()->json(['message' => 'GroupChatMesage Not Found'], 404);
    }
}
