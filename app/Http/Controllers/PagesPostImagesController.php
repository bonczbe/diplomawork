<?php

namespace App\Http\Controllers;

use App\Models\PagesPost;
use App\Models\PagesPostImages;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class PagesPostImagesController extends Controller
{
    /**
     * It returns a JSON object of all the images associated with a post.
     * 
     * @param id The id of the post
     * 
     * @return A collection of images.
     */
    
    public function index($id)
    {
        return PagesPostImages::where('postID',$id)->toJSson();
    }

    /**
     * It returns the imageURI and date of all posts from a page, ordered by date.
     * </code>
     * 
     * @param id the id of the page
     * 
     * @return An array of objects.
     */
    public function indexByPage($id)
    {
        return DB::table('pages_post_images')
        ->select('pages_post_images.imageURI', 'pages_posts.date')
        ->join('pages_posts', 'pages_posts.id', '=', 'pages_post_images.postID')
        ->where('pages_posts.pageID',"=", $id)
        ->orderBy('pages_posts.date','Desc')
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
        $newImageorVideo = new PagesPostImages;
        $newImageorVideo->postID = $request->input('postID');
        $file = $request->file('image');
        $fileName = $request->input('postID').'_'.time().'_'.$file->getClientOriginalName();
        $file->storeAs('/public/images'.$paths['pages_post_images'],$fileName);
        $newImageorVideo->imageURI = asset('/storage/images'.$paths['pages_post_images'].'/'.$fileName);
        if ($newImageorVideo->save())
        {
            //PagesPost::where('id',$request->input('postID'))->update(array('isFile'=>true));
            return response()->json(['message'=>'PagePostImage Successfully Added'],200);
        }
        return response()->json(['message'=>'PagePostImage Failed To Add'],404);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\PagesPostImages  $pagesPostImages
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return PagesPostImages::where('id', $id)->first();
    }

    /**
     * It deletes a post image from the database and the storage
     * 
     * @param id The id of the image you want to delete
     */
    public function destroy($id)
    {
        if(!Auth::check()) return response()->json(['message'=>'Permissoin denied access'],404);
        $deletePostImage = PagesPostImages::where('id',$id)->first();
        if($deletePostImage){
            Storage::delete($deletePostImage->imageURI);
            $Images = PagesPostImages::where('postID',$deletePostImage->postID)->get();
            if(count($Images)<2){
                $leftImage = PagesPost::where('id', $deletePostImage->postID)->first();
                $leftImage->isFile = false;
                $leftImage->save();
            }
            $deletePostImage->delete();
            return response()->json(['message'=>'PostImage Deleted'],200);
        }
        return response()->json(['message'=>'PostImage Not Found'],404);
    }
}
