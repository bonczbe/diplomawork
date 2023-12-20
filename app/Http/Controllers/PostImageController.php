<?php

namespace App\Http\Controllers;

use App\Models\PostImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\Posts;
use Illuminate\Support\Str;

class PostImageController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return PostImage::all();
    }

    /**
     * It returns all the images that have the same postID as the one passed in
     * 
     * @param id The id of the post
     * 
     * @return A collection of PostImage objects.
     */
    public function indexByID($id)
    {
        return PostImage::where('postID',$id)->get();
    }

    /**
     * It returns all the images from the post_images table that are associated with a post that is
     * associated with a user with the id of .
     * </code>
     * 
     * @param id the id of the user
     * 
     * @return An array of objects.
     */
    public function indexByUser($id)
    {
        return DB::table('post_images')
        ->select('post_images.imageURI', 'posts.date','post_images.id AS id')
        ->join('posts', 'posts.id', '=', 'post_images.postID')
        ->where('posts.userID',"=", $id)
        ->orderBy('posts.date','Desc')
        ->get();
    }

    /**
     * It takes a file from a form, stores it in a folder, and then saves the path to the file in a
     * database.
     * 
     * @param Request request The request object.
     * 
     * @return The imageURI is being returned.
     */
    public function store(Request $request)
    {
        $json = Storage::disk('local')->get('path.json');
        $paths = json_decode($json,true);
        $this->validate($request,[
            'postID' => 'required',
            'image' => 'required|image|max:2048',
        ]);
        $newImageorVideo = new PostImage;
        $newImageorVideo->postID = $request->input('postID');
        $file = $request->file('image');
        $fileName = $request->input('postID').'_'.time().'_'.$file->getClientOriginalName();
        $file->storeAs('/public/images'.$paths['post_images'],$fileName);
        $newImageorVideo->imageURI = asset('/storage/images'.$paths['post_images'].'/'.$fileName);

        if ($newImageorVideo->save())
        {
            return response()->json(['message'=>'PostImage Successfully Added'],200);
        }
        return response()->json(['message'=>'PostImage Failed To Add'],404);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\PostImage  $postImage
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return PostImage::where('id', $id)->first();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\PostImage  $postImage
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {

        $deletePostImage = PostImage::where('id',$id)->first();
        if($deletePostImage){
            Storage::delete($deletePostImage->imageURI);
            $Images = PostImage::where('postID',$deletePostImage->postID)->get();
            if(count($Images)<2){
                $leftImage = Posts::where('id', $deletePostImage->postID)->first();
                $leftImage->isFile = false;
                $leftImage->save();
            }
            $deletePostImage->delete();
            return response()->json(['message'=>'PostImage Deleted'],200);
        }
        return response()->json(['message'=>'PostImage Not Found'],404);
    }
}
