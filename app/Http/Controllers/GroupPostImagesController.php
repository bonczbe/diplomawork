<?php

namespace App\Http\Controllers;

use App\Models\GroupPostImages;
use App\Models\GroupPosts;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class GroupPostImagesController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index($id)
    {
        return GroupPostImages::where('postID',$id)->toJSson();
    }
    /**
     * It returns the imageURI and date of all the posts in a group, ordered by date.
     * </code>
     * 
     * @param id the id of the group
     * 
     * @return An array of objects.
     */
    public function indexByGroup($id)
    {
        return DB::table('group_post_images')
        ->select('group_post_images.imageURI', 'group_posts.date')
        ->join('group_posts', 'group_posts.id', '=', 'group_post_images.postID')
        ->where('group_posts.groupID',"=", $id)
        ->orderBy('group_posts.date','Desc')
        ->get();
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
            'postID' => 'required',
            'image' => 'required|image|max:2048',
        ]);
        $newImageorVideo = new GroupPostImages;
        $newImageorVideo->postID = $request->input('postID');
        $file = $request->file('image');
        $fileName = $request->input('postID').'_'.time().'_'.$file->getClientOriginalName();
        $file->storeAs('/public/images'.$paths['group_post_images'],$fileName);
        $newImageorVideo->imageURI = asset('/storage/images'.$paths['group_post_images'].'/'.$fileName);
        if ($newImageorVideo->save())
        {
            return response()->json(['message'=>'GroupPostImages Successfully Added'],200);
        }
        return response()->json(['message'=>'GroupPostImages Failed To Add'],404);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\GroupPostImages  $groupPostImages
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return GroupPostImages::where('id', $id)->first();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\GroupPostImages  $groupPostImages
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $deletePostImage = GroupPostImages::where('id',$id)->first();
        if($deletePostImage){
            Storage::delete($deletePostImage->imageURI);
            $Images = GroupPostImages::where('postID',$deletePostImage->postID)->get();
            if(count($Images)<2){
                $leftImage = GroupPosts::where('id', $deletePostImage->postID)->first();
                $leftImage->isFile = false;
                $leftImage->save();
            }
            $leftImage->save();
            $deletePostImage->delete();
            return response()->json(['message'=>'GroupPostImages Deleted'],200);
        }
        return response()->json(['message'=>'GroupPostImages Not Found'],404);
    }
}
