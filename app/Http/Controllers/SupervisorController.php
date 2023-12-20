<?php

namespace App\Http\Controllers;

use App\Mail\SendMail;
use App\Models\Report;
use App\Models\Supervisor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class SupervisorController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $admin = Supervisor::where('id', Auth::user()->id)->first();
        if (!Auth::check()||$admin->role!=2) return response()->json(['message' => 'Permission denied to store new Admin!'], 404);
        return Supervisor::get(["email","phone","tag","id","firstName","middleName","lastName","role"]);
    }

    /**
     * It gets all the admins, then for each admin it gets all the reports that are not checked and are
     * more than 15 reports for the same user, and then it gets the 15th report from the last one.
     * </code>
     *
     * @return A collection of admins, each admin has a property called allchecked which is a
     * collection of reports.
     */
    public function indexWithInfos()
    {
        $admin = Supervisor::where('id', Auth::user()->id)->first();
        if (!Auth::check()||$admin->role!=2) return response()->json(['message' => 'Permission denied to store new Admin!'], 404);
        $admins = Supervisor::get(["email","phone","tag","id","firstName","middleName","lastName","role"]);
        $admins->map(function($admin){
            $admin->allchecked=Report::selectRaw('COUNT(userID) AS num_reports, CONCAT(type, outsideID) AS concated, MAX(type) AS type, MAX(outsideID) AS outsideID, MAX(id) AS id, MAX(userID) AS userID, MAX(checked) AS checked, MAX(whoChecked) AS whoChecked')
            ->groupBy('concated')
            ->havingRaw('whoChecked = '.$admin->id)
            ->orderByRaw('(SELECT reportDate FROM reports r2 WHERE CONCAT(r2.type, r2.outsideID) = concated ORDER BY r2.reportDate LIMIT 14, 1) ASC')
            ->count();
        });
        return $admins;
    }

    /**
     * It takes the email and password from the request, checks if the user exists, if it does, it
     * checks if the password matches, if it does, it logs the user in and returns a token
     *
     * @param Request request The request object.
     */
    public function login(Request $request)
{
    $request->validate([
        'email'    => 'required',
        'password' => 'required',
    ]);

    $Passwd = base64_decode($request->input('password'));
    $user = Supervisor::where('email', $request->input('email'))->first();

    if (!$user) {
        return response()->json([
            'message' => 'User Not Found'
        ], 404);
    }
    if (!Auth::guard('supervisor')->attempt(['email' => $request->input('email'), 'password' => $Passwd])) {
        return response()->json([
            'status' => false,
            'message' => 'Email & Password do not match our records.',
        ], 401);
    }

    if (is_null($user->email_verified_at) && !is_null($user->email_verify)) {
        return response()->json(['message' => 'User Not Verified!'], 400);
    }

    Supervisor::where('id', $user->id)->update([
        'lastLoggedinDate' => Carbon::now(),
        'newPassHash' => null
    ]);

    return response()->json([
        'message' => 'User Logged In Successfully',
        'id' => $user->id,
        'firstName' => $user->firstName,
        'tag' => $user->tag,
        'email' => $user->email,
        'isDark' => $user->isDark,
        'role' => $user->role,
        'token' => $user->createToken('mobile', ['role:admin'])
    ], 200);
}

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $admin = Supervisor::where('id', Auth::user()->id)->first();
        if (!Auth::check()||$admin->role!=2) return response()->json(['message' => 'Permission denied to store new Admin!'], 404);
        $this->validate($request, [
            'email' => 'required',
            'phone' => 'required',
            'firstName' => 'required',
            'lastName' => 'required',
            'password' => 'required',
            'birthDate' => 'required',
            'userID' => 'required',
            'role' => 'required',
            'isDark' => 'required',
            'tag' => 'required',
        ]);
        $Passwd = base64_decode($request->input('password'));
        if (!preg_match('/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%?&.,-])(?=.*[a-zA-Z]).{8,}$/', $Passwd)) {
            return response()->json(['message' => 'Does not meet with the password requirements!'], 404);
        }
        $existTag = Supervisor::where('tag', $request->input('tag'))->first();
        $new = new Supervisor;
        $new->email = $request->input('email');
        $new->phone = $request->input('phone');
        $new->email_verified_at = null;
        $new->firstName = $request->input('firstName');
        $new->isDark = $request->input('isDark');
        $new->middleName = ($request->input('middleName') != null) ? $request->input('middleName') : null;
        $new->lastName = $request->input('lastName');
        $new->tag = ($existTag == null) ? $request->input('tag') : $request->input('firstName') . $request->input('birthDate') . Str::uuid();
        $new->password = Hash::make($Passwd);
        $new->birthDate = $request->input('birthDate');
        $new->lastLoggedinDate = Carbon::now();
        $new->role = ($request->input('role') != null) ? $request->input('role') : 1;
        /* The above code is generating a unique email verification code for a user. */
        $new->email_verify = str_replace('.','',str_replace('/', '', substr(Hash::make((Str::uuid() . str_shuffle(md5($new->firstName . $new->lastName)) . Str::uuid())), 0, 512)));
        if ($new->save()) {
            $middleName = "";
            if ($new->middleName) $middleName = $new->middleName . ' ';
            $owner = '' . $new->firstName . ' ' . $middleName . $new->lastName;
            $mailData = [
                'subject' => 'Email verification',
                'title' => 'Welcome to the Admin Team!',
                'body' => 'Dear ' . $owner . '! You can verificate your email with the following link: ' . url("/supervisors/panel/emailVerification/" . $new->email_verify). ' After that make a password reset!'
            ];

            Mail::to($new->email)->send(new SendMail($mailData));
            $new->password="";
            return $new;
        }
        return response()->json(['message' => 'Supervisor Failed To Add'], 404);
    }

    /**
     * It takes a hash from the url, finds the user with that hash, sets the email_verified_at field to
     * the current time, sets the email_verify field to null, and returns a response
     *
     * @param Request request The request object.
     */
    public function getVerification(Request $request)
    {
        $this->validate($request, [
            'hash' => 'required',
        ]);
        $User = Supervisor::where("email_verify", $request->input('hash'))->first();
        if ($User) {
            $User->email_verified_at = Carbon::now();
            $User->email_verify = null;
            if ($User->save()) {
                return response()->json(['message' => 'Admin verified!'], 200);
            }
            return response()->json(['message' => 'Verification failed!'], 400);
        }
        return response()->json(['message' => 'User not found'], 404);
    }

    /**
     * It takes a request, validates it, then checks if the user exists, if the user exists, it updates
     * the password and the hash, if the user doesn't exist, it returns a 404
     *
     * @param Request request The request object.
     *
     * @return The response is a JSON object with a message and a status code.
     */
    public function forgottenSetNewPasswd(Request $request)
    {
        $this->validate($request, [
            'email' => 'required|email',
            'passwd' => 'required|string',
            'passwd2' => 'required|string',
            'hash' => 'required|string'
        ]);
        $Passwd = base64_decode($request->input('passwd'));
        $Passwd2 = base64_decode($request->input('passwd2'));
        if (!preg_match('/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%?&.,-])(?=.*[a-zA-Z]).{8,}$/', $Passwd)) {
            return response()->json(['message' => 'Does not meet with the password requirements!'], 404);
        }
        if ($Passwd!=$Passwd2) {
            return response()->json(['message' => 'The 2 given password is not thew same!'], 404);
        }
        $User = Supervisor::where("email", $request->input('email'))->where('newPassHash', $request->input('hash'))->first();
        if ($User) {
            if(Hash::make($Passwd)==$User->passwd){
                return response()->json(['message' => 'Your old password is the same as the new!'], 400);
            }
            $User->resetedPasswd = $User->password;
            $User->password = Hash::make($Passwd);
            $User->newPassHash = null;
            if ($User->save()) {
                return response()->json(['message' => 'User Successfully Updated'], 200);
            }
            return response()->json(['message' => 'Did not added a emailHash!'], 400);
        }
        return response()->json(['message' => 'User not found'], 404);
    }

    /**
     * It generates a hash, saves it to the database, and sends an email to the user with the hash
     *
     * @param Request request The request object.
     *
     * @return A JSON response with a message.
     */
    public function forgotten(Request $request)
    {
        $this->validate($request, [
            'email' => 'required|email',
        ]);
        $User = Supervisor::where("email", $request->input('email'))->first();
        if ($User) {
            $User->newPassHash = str_replace('/', '', substr(Hash::make((Str::uuid() . str_shuffle(md5($User->firstName . $User->lastName)) . Str::uuid())), 0, 512));
            if ($User->save())
                $middleName = "";
            if ($User->middleName) $middleName = $User->middleName . ' ';
            $owner = '' . $User->firstName . ' ' . $middleName . $User->lastName;
            $mailData = [
                'subject' => 'Password Reset',
                'title' => 'You or SOMEBODY asked for password reset',
                'body' => 'Dear ' . $owner . '! You can set a new password on this link, or log in to reset the hash: ' . url("/supervisors/panel/forgottenpassword/" . $User->newPassHash)
            ];

            Mail::to($User->email)->send(new SendMail($mailData)); {
                return response()->json(['message' => 'Hash generated!'], 200);
            }
            return response()->json(['message' => 'Did not added a emailHash!'], 400);
        }
        return response()->json(['message' => 'User not found'], 404);
    }

    /**
     * It logs out the user and returns a message.
     * </code>
     *
     * @param Request request The request object.
     *
     * @return <code>{
     *     "message": "Admin Logged Out"
     * }
     * </code>
     */
    public function logout(Request $request)
    {
        $request->validate(
            [
                'id' => 'required',
                'email'    => 'required',
            ]
        );
        $user = Supervisor::where('email', $request->input('email'))->where("id", $request->input('id'))->first();
        if ($user) {
            $user->lastLoggedOutDate = Carbon::now();
            $user->save();

            auth('web')->logout();

            $request->session()->invalidate();

            $request->session()->regenerateToken();

            return response()->json(['message' => 'Admin Logged Out'], 200);
        }
        return response()->json(['message' => 'Admin Not Logged Out'], 404);
    }
    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show()
    {
        return Supervisor::where('id', Auth::user()->id)->get(['id','email','phone','tag','firstName','middleName','lastName','birthDate','isDark'])->first();
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        if (Auth::user()->id != $id) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        $this->validate($request, [
            'email' => 'required',
            'phone' => 'required',
            'firstName' => 'required',
            'middleName' => 'required',
            'lastName' => 'required',
            'birthDate' => 'required',
            'Password' => 'required',
            'isDark' => 'required',
            'tag' => 'required',
        ]);
        $Supervisor = Supervisor::where("id", $id)->first();
        $oldEmail = "";
        if($Supervisor->email!=$request->input('email')){
            $oldEmail = $Supervisor->email;
            $Supervisor->email_verify = str_replace('/', '', substr(Hash::make((Str::uuid() . str_shuffle(md5($Supervisor->firstName . $Supervisor->lastName)) . Str::uuid())), 0, 512));
        }
        if (Hash::check('Password', $Supervisor->password)) {
            if ($Supervisor) {
                $Supervisor->email = $request->input('email');
                $Supervisor->phone = $request->input('phone');
                $Supervisor->tag = ($request->input('tag') != null) ? $request->input('tag') : ($request->input('firstName') . $request->input('lastName'));
                $Supervisor->firstName = $request->input('firstName');
                $Supervisor->middleName = ($request->input('middleName') != null) ? $request->input('middleName') : null;
                $Supervisor->lastName = $request->input('lastName');
                $Supervisor->birthDate = $request->input('birthDate');
                $Supervisor->isDark = $request->input('isDark');
            }
            if ($Supervisor->save()) {
                if($Supervisor->email_verify!=null){
                    $middleName = "";
                    if ($Supervisor->middleName) $middleName = $Supervisor->middleName . ' ';
                    $owner = '' . $Supervisor->firstName . ' ' . $middleName . $Supervisor->lastName;
                    $mailData = [
                        'subject' => 'Email verification',
                        'title' => 'Somebody updated your email address!',
                        'body' => 'Dear ' . $owner . '! You can verificate your email with the following link: ' . url("/supervisors/panel/emailVerification/" . $Supervisor->email_verify)." or please contact with the bubuus@gmail.com"
                    ];
                    Mail::to($Supervisor->email)->send(new SendMail($mailData));
                    Mail::to($oldEmail)->send(new SendMail($mailData));
                }
                return response()->json(['message' => 'Supervisor Successfully Updated'], 200);
            }
            return response()->json(['message' => 'Supervisor To Update'], 404);
        }
        return response()->json(['message' => 'Supervisor worng Password'], 401);
    }

    /**
     * It checks if the user is the same as the one who is trying to change the password, then it
     * checks if the old password is correct, then it checks if the new password is different from the
     * old one, then it updates the password
     *
     * @param id The id of the supervisor
     * @param Request request The request object.
     */
    public function newPasswd($id, Request $request)
    {
        if (Auth::user()->id != $id) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        $this->validate($request, [
            'password' => 'required',
            'newPassword' => 'required',
        ]);
        
        $Passwd = base64_decode($request->input('password'));
        $Passwd2 = base64_decode($request->input('newPassword'));
        if (!preg_match('/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%?&.,-])(?=.*[a-zA-Z]).{8,}$/', $Passwd)) {
            return response()->json(['message' => 'Does not meet with the password requirements!'], 404);
        }
        $Supervisor = Supervisor::where("id", $id)->first();
        if ($Supervisor) {
            if ($request->input('newPassword') != $request->input('password')) {
                $Supervisor->resetedPasswd = $Supervisor->password;
                $Supervisor->password =Hash::make( $request->input('newPassword'));
                if ($Supervisor->save()) {
                    return response()->json(['message' => 'Supervisor Password Updated!'], 200);
                }
                return response()->json(['message' => 'Failed To Update'], 404);
            }
            return response()->json(['message' => 'Supervisor Password Same As The Old Password'], 400);
        }
        return response()->json(['message' => 'Supervisor Not Found'], 404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $admin = Supervisor::where('id', Auth::user()->id)->first();
        if (!Auth::check()||$admin->role!=2) return response()->json(['message' => 'Permission denied access'], 404);
        $delete = Supervisor::where('id', $id)->first();
        if ($delete->role) return response()->json(['message' => 'Permission denied access'], 404);
        if ($delete) {
            $delete->delete();
            return response()->json(['message' => 'Supervisor Deleted'], 200);
        }
        return response()->json(['message' => 'Supervisor Not Found'], 404);
    }
}
