<?php

namespace App\Providers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;
use Psy\Readline\Hoa\Console;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        $json = Storage::disk('local')->get('path.json');
        $paths = json_decode($json,true);
        Storage::makeDirectory('public/images');
        if($paths){foreach($paths as $key=>$value){
            Storage::makeDirectory('public/images'.$value);
        }
        }
    }
}
