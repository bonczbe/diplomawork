<?php

namespace App\Http\Controllers;

use App\Models\SavedHistoryGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class SavedHistoryGroupController extends Controller
{
    /**
     * It returns all the saved history groups that belong to a user.
     * 
     * @param userId The user's id
     */
    public function index($userId)
    {
        return DB::table('saved_history_groups')
        ->join('saved_history_group_helpers','saved_history_group_helpers.id', '=', 'saved_history_groups.id')
        ->join('histories','histories.id', '=', 'saved_history_group_helpers.historyID')
        ->join('profile_pics','profile_pics.id', '=', 'saved_history_groups.actualProfilePicID')
        ->where('saved_history_groups.owner',$userId)->get();
    }
    /**
     * It returns the id, name, outsideID, profilePicURI, and place of the saved_history_groups table
     * where the owner is equal to the userId.
     * </code>
     * 
     * @param userId The user's ID
     */
    public function indexJustProfileAndName($userId)
    {
        return DB::table('saved_history_groups')
        ->join('profile_pics','profile_pics.id', '=', 'saved_history_groups.actualProfilePicID')
        ->where('saved_history_groups.owner',$userId)->get(["saved_history_groups.id AS id","saved_history_groups.name AS name","profile_pics.outsideID as outsideID","profile_pics.profilePicURI as profilePicURI","profile_pics.place as place"]);
    }
    /**
     * It returns all the histories that are associated with a group
     * 
     * @param id the id of the group
     */
    public function indexByGroup($id)
    {
        return DB::table('histories')
        ->join('saved_history_group_helpers','saved_history_group_helpers.historyID', '=', 'histories.id')
        ->where('saved_history_group_helpers.GroupID',$id)->get();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if(!Auth::check()) return response()->json(['message'=>'Permissoin denied access'],404);
        $this->validate($request,[
            'owner' => 'required',
            'name'=> 'required'
        ]);
        
        
        if(Auth::user()->id!=$request->input('owner')){
            return response()->json(['message'=>'You can not edit this!'],400);
        }
        $new = new SavedHistoryGroup;
        $new->owner = $request->input('owner');
        $new->name = $request->input('name');
        if ($new->save())
        {
            return $new;
        }
        return response()->json(['message'=>'SavedHistoryGroup Failed To Add'],404);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return SavedHistoryGroup::where('id',$id);
    }

    /**
     * It updates the name and profile picture of a group
     * 
     * @param Request request The request object.
     * @param id The id of the group you want to update
     * 
     * @return The response is a JSON object with the following properties:
     */
    public function update(Request $request, $id)
    {
        $this->validate($request,[
            'name'=> 'required',
            'profileID'=> 'required'
        ]);
        $exist = SavedHistoryGroup::where('id',$id)->first();
        if($exist){
            if(Auth::user()->id!=$exist->owner){
                return response()->json(['message'=>'You can not edit this!'],400);
            }
            $exist->name = $request->input('name');
            $exist->actualProfilePicID = $request->input('profileID');
            if ($exist->save())
            {
                return $exist;
            }
            return response()->json(['message'=>'SavedHistoryGroup To Update'],400);
        }
        return response()->json(['message'=>'SavedHistoryGroup Not found'],404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        if(!Auth::check()) return response()->json(['message'=>'Permissoin denied access'],404);
        $delete = SavedHistoryGroup::where('id',$id)->first();
        if($delete){
            if(Auth::user()->id!=$delete->owner){
                return response()->json(['message'=>'You can not edit this!'],400);
            }
            $delete->delete();
            return response()->json(['message'=>'Message Action Deleted'],200);
        }
        return response()->json(['message'=>'Message Action Not Found'],404);
    }
}
