<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class SupervisorSeeder extends Seeder
{
    /**
     * It inserts a new row into the supervisors table with the following values:
     * 
     * - email: teszt@bubuus.com
     * - email_verified_at: the current date
     * - birthDate: the current date
     * - phone: a random string of 11 characters
     * - tag: teszter
     * - firstName: a random string of 10 characters
     * - lastName: a random string of 10 characters
     * - password: a hashed version of the string "Teszt!Elek69."
     * - role: 2
     */
    public function run()
    {
        DB::table('supervisors')->insert([
            'email' => 'teszt@bubuus.com',
            'email_verified_at' => Carbon::now(),
            'birthDate' => Carbon::now(),
            'phone' => Str::random(11),
            'tag' => "teszter",
            'firstName' => Str::random(10),
            'lastName' => Str::random(10),
            'password' => Hash::make("Teszt!Elek69."),
            'lastName' => Str::random(10),
            'lastName' => Str::random(10),
            'birthDate' => Carbon::now(),
            'role' => 2,
        ]);
    }
}
