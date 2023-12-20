<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * It inserts a random user into the database.
     */
    public function run()
    {
        DB::table('users')->insert([
            'email' => Str::random(10) . '@bubuus.com',
            'phone' => Str::random(11),
            'tag' => Str::random(60),
            'firstName' => Str::random(10),
            'lastName' => Str::random(10),
            'password' => Hash::make(Str::uuid() . '.'),
            'lastName' => Str::random(10),
            'lastName' => Str::random(10),
            'birthDate' => Carbon::now(),
            'role' => 0,
        ]);
    }
}
