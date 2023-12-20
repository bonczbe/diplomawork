<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WallPaperSeeder extends Seeder
{
    /**
     * It inserts a row into the wall_papers table with the values of the outsideID, place, date, and
     * WallPaperPicURI columns
     */
    public function run()
    {
        DB::table('wall_papers')->insert([
            'outsideID' => 1,
            'place' => 'user',
            'date' => Carbon::now(),
            'WallPaperPicURI' => '/images/wallpaper.jpg'
        ]);
    }
}
