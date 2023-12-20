<?php

namespace App\Console;

use App\Models\History;
use Carbon\Carbon;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

use function PHPSTORM_META\map;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // $schedule->command('inspire')->hourly();
        $schedule->call(function(){
            $URIS = DB::table('histories')
            ->leftJoin('saved_history_group_helpers', 'saved_history_group_helpers.historyID', '=', 'histories.id')
            ->whereNULL('saved_history_group_helpers.historyID')
            ->where('histories.posted', '<' , Carbon::yesterday())
            ->pluck('histories.URI');
            $URIS.map(function($uri){
                $deletePic = History::find($uri);
                if($deletePic){
                    Storage::delete($deletePic->URI);
                    $deletePic->delete();
                }
            });

        })->hourly();
        $schedule->call(function(){
            $URIS = array();
            $URIS = array_merge(
                DB::table('groupmessages')->where('isFile',true)->pluck('textURI'),
                DB::table('messages_data')->where('isFile',true)->pluck('textURI'),
                DB::table('group_post_images')->pluck('imageURI'),
                DB::table('histories')
                ->leftJoin('saved_history_group_helpers', 'saved_history_group_helpers.historyID', '=', 'histories.id')
                ->whereNULL('saved_history_group_helpers.historyID')
                ->where('histories.posted', '<' , Carbon::yesterday())
                ->pluck('histories.URI'),
                DB::table('pages_post_images')->pluck('imageURI'),
                DB::table('post_images')->pluck('imageURI'),
                DB::table('personal_emotes')->pluck('emoteURI'),
                DB::table('profile_pics')->pluck('profilePicURI'),
                DB::table('wall_papers')->pluck('WallPaperPicURI')
            );
            $paths = json_decode(file_get_contents(('path.json')),true);
            $allfilepaths = [];
            foreach($paths as $key=>$value){
                $filesInFolder = File::files($key);   
                foreach($filesInFolder as $path) { 
                    $file = pathinfo($path);
                    $name= $file['dirname']+'/' . $file['basename'];
                    $name = str_replace("app/", "", $name);
                    $name = str_replace("public/", "", $name);
                    array_push($allfilepaths,$name);
                }
            }
            foreach($URIS as $value){
                $key = array_search($value,$allfilepaths,1);
                if($key !==false){
                    array_splice($allfilepaths,$key,1);
                }
            }
            foreach($allfilepaths as $value){
                Storage::delete($value);
            }

        })->quarterly();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
