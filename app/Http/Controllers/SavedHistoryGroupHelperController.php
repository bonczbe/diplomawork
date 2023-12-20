<?php

namespace App\Http\Controllers;

use App\Models\SavedHistoryGroupHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SavedHistoryGroupHelperController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return SavedHistoryGroupHelper::all()->toJson();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if (!Auth::check()) return response()->json(['message' => 'Permissoin denied access'], 404);
        $this->validate($request, [
            'GroupID' => 'required',
            'historyID' => 'required',
        ]);
        $exist = SavedHistoryGroupHelper::where('GroupID', $request->input('GroupID'))->where('historyID', $request->input('historyID'))->first();
        if ($exist)  return response()->json(['message' => 'Is already in the collection'], 404);
        $new = new SavedHistoryGroupHelper;
        $new->GroupID = $request->input('GroupID');
        $new->historyID = $request->input('historyID');
        if ($new->save()) {
            return response()->json(['message' => 'SavedHistoryGroupHelper Successfully Added'], 200);
        }
        return response()->json(['message' => 'SavedHistoryGroupHelper Failed To Add'], 404);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return SavedHistoryGroupHelper::where('id', $id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id, $groupID)
    {
        if (!Auth::check()) return response()->json(['message' => 'Permissoin denied access'], 404);
        $delete = SavedHistoryGroupHelper::where('historyID', $id)->where('GroupID', $groupID)->first();
        if ($delete) {
            $delete->delete();
            return response()->json(['message' => 'SavedHistoryGroupHelper Deleted'], 200);
        }
        return response()->json(['message' => 'SavedHistoryGroupHelper Not Found'], 404);
    }
}
