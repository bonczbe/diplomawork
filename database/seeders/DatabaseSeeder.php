<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * The run() function is called when the command is executed
     */
    public function run()
    {
        $this->call([
            ProfilePicSeeder::class,
            WallPaperSeeder::class,
            UserSeeder::class,
            SupervisorSeeder::class,
        ]);
    }
}
