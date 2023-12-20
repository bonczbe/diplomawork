<?php

namespace App\Http\Controllers;

use App\Models\MessagesData;
use App\Models\Messages;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Events\PrivateChatsEvent;

class MessagesDataController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return MessagesData::all();
    }
    /**
     * It returns all the messages from the database where the messageID is equal to the id passed to
     * the function.
     * 
     * @param id The ID of the chat
     * 
     * @return A collection of messages.
     */
    public function indexChatID($id)
    {
        return MessagesData::where('messageID', $id)->orderBy('sentData', 'DESC')->get();
    }
    /**
     * It returns all the messages that have the same messageID as the one passed in the function and
     * are files
     * 
     * @param id The id of the chat
     * 
     * @return A collection of messages that have the messageID of the id passed in and isFile is true.
     */
    public function indexChatIDImages($id)
    {
        return MessagesData::where('messageID', $id)->where('isFile', true)->orderBy('sentData', 'DESC')->get();
    }
    /**
     * It takes a request from the client, validates it, and then saves the data to the database
     * 
     * @param Request request The request object.
     * 
     * @return The response is a json object with the following properties:
     */
    public function store(Request $request)
    {
        $json = Storage::disk('local')->get('path.json');
        $paths = json_decode($json, true);
        $this->validate($request, [
            'whouserID' => 'required',
            'messageID' => 'required',
            'textURI' => 'required',
            'image' => 'nullable|image|max:2048',
        ]);

        if (Auth::user()->id != $request->input('whouserID')) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        $messages = Messages::where('id', $request->input('messageID'))->first();
        if (!$messages) return response()->json(['message' => "Message Can't Be Sent"], 400);

        $mergedID = $messages->user1ID . "" . $messages->user2ID;
        $newMessage = new MessagesData;
        $newMessage->whouserID = $request->input('whouserID');
        $newMessage->messageID = $request->input('messageID');
        $newMessage->sentData = Carbon::now();
        $newMessage->isFile = false;
        $newMessage->seen = false;
        $newMessage->seenData = null;
        if ($request->file('image')) {
            $file = $request->file('image');
            $fileName = DB::table('users')->where('id', $request->input('whouserID'))->pluck('tag')[0] . '_' . time() . '_' . $file->getClientOriginalName();
            $file->storeAs('/public/images' . $paths['messages_data'], $fileName);
            $newMessage->textURI = asset('/storage/images' . $paths['messages_data'] . '/' . $fileName);
            $newMessage->isFile = true;
        } elseif ($request->input('textURI') != "") {
            $newMessage->textURI = $request->input('textURI');
        } else {
            return response()->json(['message' => 'MessagesData text Not Found or empty'], 404);
        }
        if ($newMessage->save()) {
            event(new PrivateChatsEvent($mergedID, $newMessage, "newMessage"));
            if ($newMessage->isFile) {
                event(new PrivateChatsEvent($mergedID, $newMessage, "newImage"));
            }
            return response()->json($newMessage, 200);
        }
        return response()->json(['message' => 'MessageDate Failed To Add'], 404);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id, $messageID)
    {
        return MessagesData::where("id", $id)->where('messageID', $messageID)->orderBy('sentData', 'DESC')->get();
    }



    /**
     * It updates the seen status of a message to true and sends a notification to the sender that the
     * message has been seen.
     * </code>
     * 
     * @param id the id of the message
     * @param whouserID The user who is currently logged in.
     * 
     * @return <code>{
     *     "message": "Nothing to update!"
     * }
     * </code>
     */
    public function setSeen($id, $whouserID)
    {
        $setSeenMessageData = MessagesData::where("messageID", $id)->where('whouserID', '!=', $whouserID)->where("seen", false)->orderBy('sentData', 'DESC')->first();
        if ($setSeenMessageData) {
            MessagesData::where("messageID", $id)->where('whouserID', '!=', $whouserID)->where("seen", false)->update([
                'seen' => true,
                'seenData' => Carbon::now()
            ]);
            $messages = Messages::where('id', $setSeenMessageData->messageID)->first();
            $mergedID = $messages->user1ID . "" . $messages->user2ID;
            $setSeenMessageData->seen = true;
            $setSeenMessageData->sentData = Carbon::now();
            event(new PrivateChatsEvent($mergedID, $setSeenMessageData, "seenMessage"));
            return response()->json(['message' => 'MessageData Seen Successfully updated'], 200);
        }
        return response()->json(['message' => 'Nothing to update!'], 200);
    }

    /**
     * It deletes a message from the database and also deletes the file if it's a file
     * 
     * @param id The id of the message to be deleted
     * 
     * @return The response is being returned as a JSON object.
     */
    public function destroy($id)
    {
        $deleteMessagesData = MessagesData::where('id', $id)->first();
        if (Auth::user()->id != $deleteMessagesData->whouserID) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        if ($deleteMessagesData) {
            $messages = Messages::where('id', $deleteMessagesData->messageID)->first();
            $mergedID = $messages->user1ID . "" . $messages->user2ID;
            if ($deleteMessagesData->isFile) {
                Storage::delete($deleteMessagesData->textURI);
            }
            event(new PrivateChatsEvent($mergedID, $deleteMessagesData, "destroyMessage"));
            if ($deleteMessagesData->isFile) {
                event(new PrivateChatsEvent($mergedID, $deleteMessagesData, "removeImage"));
            }
            if ($deleteMessagesData->delete()) {
                return response()->json(['message' => 'MessagesData Deleted'], 200);
            }
            return response()->json(['message' => 'Something went wrong'], 400);
        }
        return response()->json(['message' => 'MessagesData Not Found'], 404);
    }
}
