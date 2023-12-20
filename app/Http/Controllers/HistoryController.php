<?php

namespace App\Http\Controllers;

use App\Models\History;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\Relations;
use App\Models\User;
use App\Models\ProfilePic;
use App\Models\SavedHistoryGroup;
use App\Models\SavedHistoryGroupHelper;

class HistoryController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return History::all();
    }
    /**
     * It gets all the histories of a user and all the histories of the groups that the user owns
     *
     * @param id the id of the user
     */
    public function index24ByUser($id)
    {
        $ownhistories = json_decode ("{}");
        $histories = History::where('who', $id)
        ->whereDate('posted', '>', Carbon::now()->subDays(1)->toDateString())
    ->orWhere(function($query) use($id) {
        $query->whereDate('posted', Carbon::now()->toDateString())
              ->whereTime('posted', '>', Carbon::now()->subDays(1)->toTimeString())
              ->where('who', $id);
    })
        ->orderBy('posted')
        ->get();
        $owner = User::where('id',$id)->get(['firstName','middleName','lastName','actualProfilePicID','id'])->first();
        $histories->owner =$owner;
        $owner->ProfilePic = ProfilePic::where('id',$owner->actualProfilePicID)->get(["profilePicURI"])->first();
        $middleName="";
        if($owner->middleName) $middleName = $owner->middleName.' ';
        $owner->name = ''.$owner->firstName.' '.$middleName.$owner->lastName;
        $own24Hours = json_decode ("{}");
        $own24Hours->histories= $histories;
        $own24Hours->owner= $owner;



        $groupHistores = collect();
        $groups = SavedHistoryGroup::where('owner',$id)->get();
        $groupHistores = $groups->map(function($group) use($id,$groupHistores){
            $savedhistoriesByGroup = collect();
            $histories = SavedHistoryGroupHelper::where('GroupID',$group->id)->get();
            $savedhistoriesByGroup = $histories->map(function($toGetHistory) use($savedhistoriesByGroup){
                $history =History::where('id',$toGetHistory->historyID)->get()->first();
                return $savedhistoriesByGroup = $savedhistoriesByGroup->merge($history);
            });
            $groupWithHistories = json_decode ("{}");
            $group->ProfilePic = ProfilePic::where('id',$group->actualProfilePicID)->get(["profilePicURI"])->first();
            $groupWithHistories->data = $group;
            $groupWithHistories->histories = $savedhistoriesByGroup;
            if(count($savedhistoriesByGroup)>0) return $groupHistores = $groupHistores->merge($groupWithHistories);
        });
        $groupHistores= $groupHistores->filter(function($group){
            return $group!=null;
        });
        $ownhistories->owner= $own24Hours;
        $ownhistories->groups= $groupHistores;

        return $ownhistories;
    }
    /**
     * It gets the histories of the user and his friends
     *
     * @param id the user id
     *
     * @return A collection of histories.
     */
    public function index24ByUserFriends($id)
    {
        $historiesCollection = json_decode ("{}");


        $ownhistories = json_decode ("{}");
        $histories = History::where('who', $id)
        ->whereDate('posted', '>', Carbon::now()->subDays(1)->toDateString())
    ->orWhere(function($query) use($id) {
        $query->whereDate('posted', Carbon::now()->toDateString())
              ->whereTime('posted', '>', Carbon::now()->subDays(1)->toTimeString())
              ->where('who', $id);
    })
        ->orderBy('posted')
        ->get();
        $owner = User::where('id',$id)->get(['firstName','middleName','lastName','actualProfilePicID','id'])->first();
        $owner->ProfilePic = ProfilePic::where('id',$owner->actualProfilePicID)->get(["profilePicURI"])->first();
        $middleName="";

        if($owner->middleName) $middleName = $owner->middleName.' ';
        $owner->name = ''.$owner->firstName.' '.$middleName.$owner->lastName;

        $ownhistories->histories= $histories;
        $ownhistories->owner= $owner;


        $friendsHistories = collect();
        $relations = Relations::where(function($query) use ($id){
            $query->where("user1ID",$id)->orWhere("user2ID",$id);
        })->where("type","<",4)->where("type",">",0)->get();


        $friendsHistories = $relations->map(function($friend) use($id,$friendsHistories){
            $otherUser = (($friend->user1ID==$id)?$friend->user2ID:$friend->user1ID);

            $friendHistories = History::where('who', $otherUser)
            ->whereDate('posted', '>', Carbon::now()->subDays(1)->toDateString())
            ->orWhere(function($query) use($id) {
                $query->whereDate('posted', Carbon::now()->toDateString())
                      ->whereTime('posted', '>', Carbon::now()->subDays(1)->toTimeString())
                      ->where('who', $id);
            })
        ->orderBy('posted')
        ->get();


            $friend = User::where('id',$otherUser)->get(['firstName','middleName','lastName','actualProfilePicID','id'])->first();
            $friend->ProfilePic = ProfilePic::where('id',$friend->actualProfilePicID)->get(["profilePicURI"])->first();
            $middleName="";
            if($friend->middleName) $middleName = $friend->middleName.' ';
            $friend->name = ''.$friend->firstName.' '.$middleName.$friend->lastName;
            $friendhis = json_decode ("{}");
            $friendhis->histories= $friendHistories;
            $friendhis->owner= $friend;
            if(count($friendHistories)>0){
                return $friendsHistories = $friendsHistories->merge($friendhis);
            }
        });
        $friendsHistories= $friendsHistories->filter(function($friend){
            return $friend!=null;
        });
        $historiesCollection->owner = $ownhistories;
        $historiesCollection->friends= $friendsHistories;

        return $historiesCollection;
    }
    /**
     * It takes a group id, gets the group, gets the histories in the group, and returns the group with
     * the histories
     *
     * @param id the id of the group
     *
     * @return Collection
     * */
    public function showAGroup($id)
    {
        $ownhistories = json_decode ("{}");
        $groupHistores = collect();
        $groups = SavedHistoryGroup::where('id',$id)->get();
        $groupHistores = $groups->map(function($group) use($id,$groupHistores){
            $savedhistoriesByGroup = collect();
            $histories = SavedHistoryGroupHelper::where('GroupID',$group->id)->get();
            $savedhistoriesByGroup = $histories->map(function($toGetHistory) use($savedhistoriesByGroup){
                $history =History::where('id',$toGetHistory->historyID)->get()->first();
                return $savedhistoriesByGroup = $savedhistoriesByGroup->merge($history);
            });
            $groupWithHistories = json_decode ("{}");
            $group->ProfilePic = ProfilePic::where('id',$group->actualProfilePicID)->get(["profilePicURI"])->first();
            $groupWithHistories->data = $group;
            $groupWithHistories->histories = $savedhistoriesByGroup;
            if(count($savedhistoriesByGroup)>0) return $groupHistores = $groupHistores->merge($groupWithHistories);
        });
        $groupHistores= $groupHistores->filter(function($group){
            return $group!=null;
        });
        $ownhistories= $groupHistores;

        return $ownhistories;
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $json = Storage::disk('local')->get('path.json');
        $paths = json_decode($json,true);
        $this->validate($request,[
            'who' => 'required',
            'fileImage' => 'required|mimes:mp4,mov,ogg,qt,jpeg,png,jpg,gif | max:20000'
        ]);
        if(Auth::user()->id!=$request->input('who')){
            return response()->json(['message'=>'You can not edit this!'],400);
        }
        $newMessage = new History();
        $newMessage->who = $request->input('who');
        $newMessage->posted = Carbon::now();
        $file = $request->file('fileImage');
        $fileName = DB::table('users')->where('id',$request->input('userID'))->pluck('tag').'_'.time().'_'.Str::uuid().'_'.$file->getClientOriginalName();
        $file->storeAs('/public/images'.$paths['histories'],$fileName);
        $newMessage->URI = asset('/storage/images'.$paths['histories'].'/'.$fileName);
        if ($newMessage->save())
            {
                return $newMessage;
            }
            return response()->json(['message'=>'Histrory Failed To Add'],404);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return History::where('id',$id)->first();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $deletePic = History::where('id',$id)->first();
        if($deletePic){
            if(Auth::user()->id!=$deletePic->who){
                return response()->json(['message'=>'You can not edit this!'],400);
            }
            Storage::delete($deletePic->URI);
            $deletePic->delete();
            return response()->json(['message'=>'Pic Deleted'],200);
        }
        return response()->json(['message'=>'Pic Not Found'],404);
    }
}
