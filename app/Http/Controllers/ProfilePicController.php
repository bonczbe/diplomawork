<?php

namespace App\Http\Controllers;

use App\Models\ProfilePic;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProfilePicController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return ProfilePic::all();
    }
    /**
     * It returns all the profile pictures of a user with a specific outsideID and place, ordered by id
     * descending, and pushes the default profile picture to the end of the array
     * 
     * @param place is the place where the profile picture is being used.
     * @param id The id of the user
     * 
     * @return A collection of ProfilePic objects.
     */
    public function indexByOutsideID($place,$id)
    {
        return ProfilePic::where('outsideID', $id)->where("place",$place)->orderBy('id','Desc')->get()->push(ProfilePic::where('id',1)->first());
    }

    /**
     * It takes a file, stores it in the storage/app/public/images folder, and then returns the path to
     * the file.
     * </code>
     * 
     * @param Request request The request object
     * 
     * @return The response is a JSON object with the following structure:
     */
    public function store(Request $request)
    {
        $json = Storage::disk('local')->get('path.json');
        $paths = json_decode($json,true);
        $this->validate($request,[
            'outsideID' => 'required',
            'place' => 'required',
            'image' => 'required|image|max:2500',
        ]);
        $place = $request->input("place");
        $newProfilePic = new ProfilePic;
        $newProfilePic->outsideID = $request->input('outsideID');
        $file = $request->file('image');
        if($place=='user'){
            $imageName = DB::table('users')->where('id',$request->input('outsideID'))->pluck('tag')[0].'_'.time().'_'.$file->getClientOriginalName();
            $file->storeAs('/public/images'.$paths['profile_picsUser'],$imageName);
            $newProfilePic->profilePicURI = asset('/storage/images'.$paths['profile_picsUser'].'/'.$imageName);
        }elseif($place=='groupChat'){
            $imageName = DB::table('groupchats')->where('id',$request->input('outsideID'))->pluck('name')[0].'_'.time().'_'.$file->getClientOriginalName();
            $file->storeAs('/public/images'.$paths['profile_picsgroupChat'],$imageName);
            $newProfilePic->profilePicURI = asset('/storage/images'.$paths['profile_picsgroupChat'].'/'.$imageName);
        }elseif($place=='page'){
            $imageName = DB::table('pages')->where('id',$request->input('outsideID'))->pluck('name')[0].'_'.time().'_'.$file->getClientOriginalName();
            $file->storeAs('/public/images'.$paths['profile_picsPage'],$imageName);
            $newProfilePic->profilePicURI = asset('/storage/images'.$paths['profile_picsPage'].'/'.$imageName);
        }elseif($place=='group'){
            $imageName = DB::table('groups')->where('id',$request->input('outsideID'))->pluck('name')[0].'_'.time().'_'.$file->getClientOriginalName();
            $file->storeAs('/public/images'.$paths['profile_picsGroup'],$imageName);
            $newProfilePic->profilePicURI = asset('/storage/images'.$paths['profile_picsGroup'].'/'.$imageName);
        }elseif($place=='historygroup'){
            $imageName = DB::table('saved_history_groups')->where('id',$request->input('outsideID'))->pluck('name')[0].'_'.time().'_'.$file->getClientOriginalName();
            $file->storeAs('/public/images'.$paths['profile_picsHistorygroup'],$imageName);
            $newProfilePic->profilePicURI = asset('/storage/images'.$paths['profile_picsHistorygroup'].'/'.$imageName);
        }elseif($place=='event'){
            $imageName = DB::table('events')->where('id',$request->input('outsideID'))->pluck('name')[0].'_'.time().'_'.$file->getClientOriginalName();
            $file->storeAs('/public/images'.$paths['profile_picsEvent'],$imageName);
            $newProfilePic->profilePicURI = asset('/storage/images'.$paths['profile_picsEvent'].'/'.$imageName);
        }else{
            return response()->json(['message'=>'Place not available'],400);
        }
        $newProfilePic->place = $place;
        $newProfilePic->date = Carbon::now();
        if ($newProfilePic->save())
        {
            if($place=='user'){
                DB::table('users')->where('id',$newProfilePic->outsideID)->update(['actualProfilePicID'=>$newProfilePic->id]);
            }elseif($place=='groupChat'){
                DB::table('groupchats')->where('id',$newProfilePic->outsideID)->update(['actualProfilePicID'=>$newProfilePic->id]);
            }elseif($place=='page'){
                DB::table('pages')->where('id',$newProfilePic->outsideID)->update(['actualProfilePicID'=>$newProfilePic->id]);
            }elseif($place=='group'){
                DB::table('groups')->where('id',$newProfilePic->outsideID)->update(['actualProfileID'=>$newProfilePic->id]);
            }elseif($place=='historygroup'){
                DB::table('saved_history_groups')->where('id',$newProfilePic->outsideID)->update(['actualProfilePicID'=>$newProfilePic->id]);
            }elseif($place=='event'){
                DB::table('events')->where('id',$newProfilePic->outsideID)->update(['actualProfilePicID'=>$newProfilePic->id]);
            }
            return $newProfilePic;
        }
        return response()->json(['message'=>'ProfilePic Failed To Add'],404);
    }
    /**
     * If the id is 1, return the profilePicURI of the profilePic with the id of 1.
     * If the id is not 1, return the profilePicURI of the profilePic with the id of id and the
     * outsideID of outsideID.
     * 
     * @param id the id of the profile pic
     * @param outsideID the id of the user, group, page, etc.
     * 
     * @return The profilePicURI of the profilePic with the id of 1 or the profilePicURI of the
     * profilePic with the id of  and the outsideID of .
     */
    public function show($id,$outsideID)
    {
        if($id==1) return ProfilePic::where("id", $id)->first();
        return ProfilePic::where("id", $id)->first();
    }
    public function showActual($place,$outsideID)
    {
        $thingData = json_decode("{}");
        if($place=='user'){
            $thingData = DB::table('users')->where('id',$outsideID)->get(['actualProfilePicID'])->first();
        }elseif($place=='groupChat'){
            $thingData = DB::table('groupchats')->where('id',$outsideID)->get(['actualProfilePicID'])->first();
        }elseif($place=='page'){
            $thingData = DB::table('pages')->where('id',$outsideID)->get(['actualProfilePicID'])->first();
        }elseif($place=='group'){
            $thingData = DB::table('groups')->where('id',$outsideID)->get(['actualProfileID'])->first();
        }elseif($place=='historygroup'){
            $thingData = DB::table('saved_history_groups')->where('id',$outsideID)->get(['actualProfilePicID'])->first();
        }elseif($place=='event'){
            $thingData = DB::table('events')->where('id',$outsideID)->get(['actualProfilePicID'])->first();
        }else{
            $thingData = null;
        }
        if($thingData){
            return ProfilePic::where("id", ($place=='group')?$thingData->actualProfileID:$thingData->actualProfilePicID)->get(['profilePicURI'])->first();
        }
        return response()->json(['message'=>'ProfilePic Not Found'],404);
    }
    /**
     * It deletes a profile picture from the database and the storage
     * 
     * @param id The id of the profile pic
     * @param place user, groupChat, page, group, historygroup
     * @param user the user who is deleting the profile pic
     * 
     * @return The response is being returned as a JSON object.
     */
    public function destroy($id,$place,$user)
    {
        if($id==1) return response()->json(['message'=>'ProfilePic Not Found'],400);
        $deleteProfilePic = ProfilePic::where('id',$id)->first();
        if($deleteProfilePic){
            if($place=='user'){
                DB::table('users')->where('id',$deleteProfilePic->outsideID)->update(['actualProfilePicID'=>1]);
            }elseif($place=='groupChat'){
                DB::table('groupchats')->where('id',$deleteProfilePic->outsideID)->update(['actualProfilePicID'=>1]);
            }elseif($place=='page'){
                DB::table('pages')->where('id',$deleteProfilePic->outsideID)->update(['actualProfilePicID'=>1]);
            }elseif($place=='group'){
                DB::table('groups')->where('id',$deleteProfilePic->outsideID)->update(['actualProfilePicID'=>1]);
            }elseif($place=='historygroup'){
                DB::table('saved_history_groups')->where('id',$deleteProfilePic->outsideID)->update(['actualProfilePicID'=>1]);
            }
            Storage::delete($deleteProfilePic->profilePicURI);
            $deleteProfilePic->delete();
            return response()->json(['message'=>'ProfilePic Deleted'],200);
        }
        return response()->json(['message'=>'ProfilePic Not Found'],404);
    }
}
