<?php

namespace App\Http\Controllers;

use App\Models\Alerts;

class AlertsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index($id)
    {
        return Alerts::where("userID", $id)->orderBy('sentDate', 'DESC')->get();
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create($userID, $message, $type, $sentDate)
    {
        $alert = new Alerts();
        $alert->userID = $userID;
        $alert->message = $message;
        $alert->type = $type;
        $alert->sentDate = $sentDate;
        $alert->save();
        return $alert;
    }

    /**
     * It updates the seen column to true for the latest alert that has not been seen yet.
     * </code>
     * 
     * @param userID The userID of the user who is logged in.
     */
    public function setSeen($userID)
    {
        $setSeenMessageData = Alerts::where('userID', $userID)->where("seen", false)->orderBy('sentDate', 'DESC')->first();
        if ($setSeenMessageData) {
            Alerts::where('userID', $userID)->where("seen", false)->update([
                'seen' => true
            ]);
            return response()->json(['message' => 'Alerts Seen Successfully updated'], 200);
        }
        return response()->json(['message' => 'Nothing to update!'], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Alerts  $alerts
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $delete = Alerts::where('id', $id)->first();
        if ($delete) {
            $delete->delete();
            return response()->json(['message' => 'Alert Deleted'], 200);
        }
        return response()->json(['message' => 'Alert Did Not Deleted'], 404);
    }
}
