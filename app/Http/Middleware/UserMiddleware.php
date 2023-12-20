<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class UserMiddleware
{
    /**
     * If the user has the role:user permission, then let them through. Otherwise, return a 401 error
     * 
     * @param Request request The incoming request.
     * @param Closure next The next middleware to be executed.
     * 
     * @return A JSON response with a message of "Not Authorized" and a status code of 401.
     */
    
    public function handle(Request $request, Closure $next)
    {
        if (auth()->check()) {
            return $next($request);
        }

        return response()->json('Not Authorized', 401);
    }
}