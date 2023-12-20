<?php

namespace App\Http\Controllers;

use App\Models\WallPaper;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class WallPaperController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return WallPaper::all()->toJson();
    }
    /**
     * It returns all the wallpapers that have the same outsideID as the one passed in, and the place
     * is the same as the one passed in, and it orders them by id in descending order, and then it
     * pushes the first wallpaper with an id of 1 to the end of the array
     * 
     * @param place the place where the wallpaper is located
     * @param id The id of the wallpaper
     * 
     * @return A collection of Wallpaper objects.
     */
    public function indexByOutsideID($place,$id)
    {
        return WallPaper::where('outsideID', $id)->where("place",$place)->orderBy('id','Desc')->get()->push(Wallpaper::where('id',1)->first());
    }

   /**
    * It takes a request, validates it, then stores the image in the correct folder, and then saves the
    * image's path in the database.
    * </code>
    * 
    * @param Request request The request object.
    * 
    * @return The response is a json object with a message and an id.
    */
    public function store(Request $request)
    {
        $json = Storage::disk('local')->get('path.json');
        $paths = json_decode($json,true);
        $this->validate($request,[
            'outsideID' => 'required',
            'place' => 'required',
            'image' => 'required|image|max:4000',
        ]);
        $place = $request->input("place");
        $newWallPaper = new WallPaper;
        $newWallPaper->outsideID = $request->input('outsideID');
        $file = $request->file('image');
        if($place=='user'){
            $imageName = DB::table('users')->where('id',$request->input('outsideID'))->pluck('tag')[0].'_'.time().'_'.$file->getClientOriginalName();
            $file->storeAs('/public/images'.$paths["wall_papersUser"]."/", $imageName);
            $newWallPaper->WallPaperPicURI = asset('/storage/images'.$paths["wall_papersUser"]."/".$imageName);
        }elseif($place=='page'){
            $imageName = DB::table('pages')->where('id',$request->input('outsideID'))->pluck('name')[0].'_'.time().'_'.$file->getClientOriginalName();
            $file->storeAs('/public/images'.$paths["wall_papersPage"]."/", $imageName);
            $newWallPaper->WallPaperPicURI = asset('/storage/images'.$paths["wall_papersPage"]."/".$imageName);
        }elseif($place=='group'){
            $imageName = DB::table('groups')->where('id',$request->input('outsideID'))->pluck('name')[0].'_'.time().'_'.$file->getClientOriginalName();
            $file->storeAs('/public/images'.$paths["wall_papersGroup"]."/", $imageName);
            $newWallPaper->WallPaperPicURI = asset('/storage/images'.$paths["wall_papersGroup"]."/".$imageName);
        }elseif($place=='event'){
            $imageName = DB::table('events')->where('id',$request->input('outsideID'))->pluck('name')[0].'_'.time().'_'.$file->getClientOriginalName();
            $file->storeAs('/public/images'.$paths["wall_papersEvent"]."/", $imageName);
            $newWallPaper->WallPaperPicURI = asset('/storage/images'.$paths["wall_papersEvent"]."/".$imageName);
        }else{
            return response()->json(['message'=>'Place not available'],400);
        }
        $newWallPaper->place = $place;
        $newWallPaper->date = Carbon::now();
        if ($newWallPaper->save())
        {
            if($place=='user'){
                DB::table('users')->where('id',$newWallPaper->outsideID)->update(['actualWallPaperID'=>$newWallPaper->id]);
            }elseif($place=='page'){
                DB::table('pages')->where('id',$newWallPaper->outsideID)->update(['actualWallPaperID'=>$newWallPaper->id]);
            }elseif($place=='group'){
                DB::table('groups')->where('id',$newWallPaper->outsideID)->update(['actualWallPaperID'=>$newWallPaper->id]);
            }
            return response()->json(['message'=>'WallPaper Successfully Added','id'=>$newWallPaper->id],200);
        }
        return response()->json(['message'=>'WallPaper Failed To Add'],404);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id,$userID)
    {
        if($id==1) return WallPaper::where("id", $id)->first();
        return WallPaper::where("id", $id)->first();
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        if($id==1) return WallPaper::where("id", $id)->get(['WallPaperPicURI'])->first();
        return WallPaper::where("id", $id)->get(['WallPaperPicURI'])->first();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id,$place,$user)
    {
        if($id==1) return response()->json(['message'=>'WallPaper Not Found'],400);
        $deleteWallPaPer = WallPaper::where('id',$id)->first();
        if($deleteWallPaPer){
            if($place=='user'){
                DB::table('users')->where('id',$deleteWallPaPer->outsideID)->update(['actualWallPaperID'=>1]);
            }elseif($place=='gropuchat'){
                DB::table('groupchats')->where('id',$deleteWallPaPer->outsideID)->update(['actualWallPaperID'=>1]);
            }elseif($place=='page'){
                DB::table('pages')->where('id',$deleteWallPaPer->outsideID)->update(['actualWallPaperID'=>1]);
            }elseif($place=='group'){
                DB::table('groups')->where('id',$deleteWallPaPer->outsideID)->update(['actualWallPaperID'=>1]);
            }
            Storage::delete($deleteWallPaPer->WallPaperPicURI);
            $deleteWallPaPer->delete();
            return response()->json(['message'=>'WallPaper Deleted'],200);
        }
        return response()->json(['message'=>'WallPaper Not Found'],404);
    }
}
