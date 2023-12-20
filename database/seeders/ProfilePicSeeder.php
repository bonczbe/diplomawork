<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProfilePicSeeder extends Seeder
{
    /**
     * It inserts a row into the profile_pics table with the values of 1, 'user', Carbon::now(), and
     * '/images/profile.png' for the columns outsideID, place, date, and profilePicURI respectively
     */
    public function run()
    {
        DB::table('profile_pics')->insert([
            'outsideID' => 1,
            'place' => 'user',
            'date' => Carbon::now(),
            'profilePicURI' => '/images/profile.png'
        ]);
    }
}
