<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
/* This is a catch all route. It will catch all the routes that are not defined in the routes file. */

Route::get('/supervisors/panel/{path?}', function () {
    return view('supervisors');
})->where('path', '.*|^$');

/* This is a catch all route. It will catch all the routes that are not defined in the routes file. */
Route::get('/{path?}', function () {
    return view('welcome');
})->where('path', '.*');
