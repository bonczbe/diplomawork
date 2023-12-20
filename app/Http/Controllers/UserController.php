<?php

namespace App\Http\Controllers;

use App\Models\ProfilePic;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\WallPaper;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\Page;
use App\Models\PagesHelper;
use App\Models\EventsHelper;
use App\Models\Events;
use App\Models\GroupMember;
use App\Models\Group;
use App\Mail\SendMail;
use App\Models\Supervisor;
use Illuminate\Support\Facades\Mail;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return DB::table('users')->orderBy('firstName', 'ASC')->paginate(15);
    }/**
     * It returns the number of users in the database.
     *
     * @return The number of users in the database.
     */

    public function numberOfUsers()
    {
        $admin = Supervisor::where('id', Auth::user()->id)->first();
        if (!Auth::check()||$admin->role!=2) return response()->json(['message' => 'Permission denied to store new Admin!'], 404);
        return User::all()->count();
    }

    /**
     * It takes a request, validates it, and then returns a query builder object.
     *
     * @param Request request The request object.
     *
     * @return A query builder object.
     */
    public function indexByName(Request $request)
    {
        $request->validate(
            [
                'lastName'    => 'required',
                'middleName' => 'required',
                'firstName' => 'required'
            ]
        );
        return DB::table('users')
            ->where('firstName', 'Like', '%' . $request->input('firstName') . '%')
            ->orWhere('middleName', 'Like', '%' . $request->input('middleName') . '%')
            ->orWhere('lastName', 'Like', '%' . $request->input('lastName') . '%');
    }
    /**
     * It checks if the user exists, if it does, it checks if the password is correct, if it is, it
     * logs the user in and returns a token.
     * </code>
     *
     * @param Request request The request object.
     *
     * @return A collection
     */
    public function login(Request $request)
    {
        $request->validate(
            [
                'email'    => 'required',
                'password' => 'required',
            ]
        );
        $Passwd = base64_decode($request->input('password'));
        $user = User::where('email', $request->input('email'))->first();
        if (!$user) return response()->json([
            'message' => 'User Not Found'
        ], 404);
        if (!Auth::attempt(['email' => $request->input('email'), 'password' => $Passwd])) {
            return response()->json([
                'status' => false,
                'message' => 'Email & Password does not match with our record.',
            ], 401);
        }
        if (is_null($user->email_verified_at)) {
            return response()->json(['message' => 'User Not Verified!'], 400);
        }
        Auth::login($user);
        User::where('id', $user->id)->update(array('lastLoggedinDate' => Carbon::now(), 'newPassHash' => null));
        return response()->json([
            'message' => 'User Logged In Successfully',
            "id" => $user->id,
            "firstName" => $user->firstName,
            "tag" => $user->tag,
            "email" => $user->email,
            'isDark' => $user->isDark,
            'token' => $user->createToken('mobile', ['role:user'])
        ], 200);
        return response()->json(['message' => 'User Not Verificated!'], 400);
    }

    /**
     * It logs out the user and invalidates the session
     *
     * @param Request request The request object.
     */
    public function logout(Request $request)
    {
        $request->validate(
            [
                'id' => 'required',
                'email'    => 'required',
            ]
        );
        $user = User::where('email', $request->input('email'))->where("id", $request->input('id'))->first();
        if ($user) {
            $user->lastLoggedOutDate = Carbon::now();
            $user->save();

            auth('web')->logout();

            $request->session()->invalidate();

            $request->session()->regenerateToken();

            return response()->json(['message' => 'User Logged Out'], 200);
        }
        return response()->json(['message' => 'User Not Logged Out'], 404);
    }
    /**
     * It validates the request, then it checks if the user accepted the terms, then it decodes the
     * password, then it checks if the password is strong enough, then it checks if the tag is unique,
     * then it creates a new user, then it checks if the user has a middle name, then it checks if the
     * user has a description, then it hashes the password, then it checks if the user has a status,
     * then it checks if the user has a gender, then it checks if the user has pronouns, then it checks
     * if the user has a role, then it checks if the user has a dark mode, then it checks if the user
     * accepted the terms, then it generates a random string, then it saves the user, then it checks if
     * the user has a middle name, then it creates a mail data array, then it sends the mail, then it
     * returns the user's id, first name and tag
     *
     * @param Request request The request object.
     *
     * @return The response is a JSON object with the following properties:
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'email' => ['required', 'email'],
            'phone' => ['required', 'regex:/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/'],
            'firstName' => 'required',
            'lastName' => 'required',
            'password' => ['required'],
            'acceptedTerms' => 'required',
            'birthDate' => 'required'
        ]);
        if ($request->input('acceptedTerms') == false) {
            return response()->json(['message' => 'Accept the terms please!'], 404);
        }
        $Passwd = base64_decode($request->input('password'));
        if (!preg_match('/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%?&.,-])(?=.*[a-zA-Z]).{8,}$/', $Passwd)) {
            return response()->json(['message' => 'Does not meet with the password requirements!'], 404);
        }
        $existTag = User::where('tag', $request->input('tag'))->first();
        $newUser = new User();
        $newUser->email = $request->input('email');
        $newUser->phone = $request->input('phone');
        $newUser->firstName = $request->input('firstName');
        $newUser->middleName = ($request->input('middleName') != null) ? $request->input('middleName') : null;
        $newUser->lastName = $request->input('lastName');
        $newUser->tag = ($existTag == null) ? $request->input('tag') : $request->input('firstName') . $request->input('birthDate') . Str::uuid();
        $newUser->description = ($request->input('description') != null) ? $request->input('description') : null;
        $newUser->password = Hash::make($Passwd);
        $newUser->birthDate = $request->input('birthDate');
        $newUser->status = ($request->input('status') != null) ? $request->input('status') : null;
        $newUser->gender = ($request->input('gender') != null) ? $request->input('gender') : null;
        $newUser->pronouns = ($request->input('pronouns') != null) ? $request->input('pronouns') : null;
        $newUser->lastLoggedinDate = null;
        $newUser->lastLoggedOutDate = null;
        $newUser->role = ($request->input('role') != null) ? $request->input('role') : 0;
        $newUser->isDark = ($request->input('isDark') != null) ? $request->input('isDark') : false;
        $newUser->acceptedTerms = $request->input('acceptedTerms');
        $newUser->email_verify = str_replace('.','',str_replace('/', '', substr(Hash::make((Str::uuid() . str_shuffle(md5($newUser->firstName . $newUser->lastName)) . Str::uuid())), 0, 512)));
        if ($newUser->save()) {
            $middleName = "";
            if ($newUser->middleName) $middleName = $newUser->middleName . ' ';
            $owner = '' . $newUser->firstName . ' ' . $middleName . $newUser->lastName;
            $mailData = [
                'subject' => 'Email verification',
                'title' => 'Thank you for registering to Bubuus!',
                'body' => 'Dear ' . $owner . '! You can verificate your email with the following link: ' . url("/emailVerification/" . $newUser->email_verify)
            ];

            Mail::to($newUser->email)->send(new SendMail($mailData));

            return response()->json([
                "id" => $newUser->id,
                "firstName" => $newUser->firstName,
                "tag" => $newUser->tag,
                'isDark' => $newUser->isDark
            ], 200);
        }
        return response()->json(['message' => 'User Failed To Add'], 404);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($input)
    {
        $User = User::where("tag", $input)->orWhere("id", $input)->get([
            'id', 'tag', 'firstName', 'middleName', 'lastName',
            'description', 'birthDate', 'status', 'canSeePostsAndImages', 'canSeeBirthDate',
            'actualProfilePicID', 'actualWallPaperID', 'gender', 'pronouns', 'work', 'school'
        ])->first();
        if ($User) {
            if (!isset($User->actualWallPaperID) || $User->actualWallPaperID == 1) {
                $User->WallpaperURI = WallPaper::where("id", $User->actualWallPaperID)->get(['WallPaperPicURI', 'id'])->first();
            } else {
                $User->WallpaperURI = WallPaper::where("id", $User->actualWallPaperID)->where("outsideID", $User->id)->get(['WallPaperPicURI', 'id'])->first();
            }
            if (!isset($User->actualProfilePicID) || $User->actualProfilePicID == 1) {
                $User->ProfilePicURI = ProfilePic::where("id", $User->actualProfilePicID)->get(['profilePicURI', 'id'])->first();
            } else {
                $User->ProfilePicURI = ProfilePic::where("id", $User->actualProfilePicID)->where("outsideID", $User->id)->get(['profilePicURI', 'id'])->first();
            }
            if (!$User->canSeeBirthDate) $User->birthDate = "0000-00-00";
        }
        return $User;
    }
    /**
     * It returns the user's name, which is a concatenation of the first name, middle name, and last
     * name.
     *
     * @param id The id of the user you want to retrieve
     *
     * @return The User object with the name property added.
     */
    public function showWithSanctum($id)
    {
        $User = User::where("id", $id)->first();
        $middleName = "";
        if ($User->middleName) $middleName = $User->middleName . ' ';
        $User->name = '' . $User->firstName . ' ' . $middleName . $User->lastName;

        return $User;
    }
    /**
     * It takes a tag and returns the id of the user with that tag
     *
     * @param tag The tag of the user you want to get the ID of.
     *
     * @return The id of the user with the tag that was passed in.
     */
    public function idFromTag($tag)
    {
        $User = User::where("tag", $tag)->first();

        return $User->id;
    }
    /**
     * It gets the first name, middle name, and last name of a user with the given id
     *
     * @param id The id of the user you want to get the name of.
     *
     * @return A JSON response with the message "User Not Found" and a 404 status code.
     */
    public function getName($id)
    {
        $User = User::where("id", $id)->get(['firstName', 'middleName', 'lastName'])->first();
        if ($User) {
            return $User->firstName . " " . (($User->middleName) ? ($User->middleName . " ") : "") . $User->lastName;
        }
        return response()->json(['message' => 'User Not Found'], 404);
    }

    /**
     * It takes a request, validates it, checks if the user is the same as the one in the database,
     * checks if the password is correct, and then updates the user
     *
     * @param Request request The request object.
     * @param id The id of the user you want to update
     *
     * @return The response is a JSON object with a message and a status code.
     */
    public function update(Request $request, $id)
    {
        $this->validate($request, [
            'phone' => ['required', 'regex:/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/'],
            'status' => 'required',
            'canSeePostsAndImages' => 'required',
            'canSeeBirthDate' => 'required',
            'gender' => 'required',
            'pronouns' => 'required',
            'tag' => 'required',
            'isDark' => 'required',
            'password' => 'required',
        ]);
        $Passwd = base64_decode($request->input('password'));
        if (Auth::user()->id != $id) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        $User = User::where("id", $id)->first();
        if (Hash::check($Passwd, $User->password)) {
            if ($User) {
                $User->phone = $request->input('phone');
                $User->tag = ($request->input('tag') != null) ? $request->input('tag') : $request->input('firstName') + $request->input('lastName');
                $User->firstName = ($request->input('firstName') != null) ? $request->input('firstName') : $User->firstName;
                $User->middleName = ($request->input('middleName') != null) ? $request->input('middleName') : $User->middleName;
                $User->lastName = ($request->input('lastName') != null) ? $request->input('lastName') : $User->lastName;
                $User->description = ($request->input('description') != null) ? $request->input('description') : null;
                $User->birthDate = ($request->input('birthDate') != null) ? $request->input('birthDate') : $User->birthDate;
                $User->status = ($request->input('status') != null) ? trim($request->input('status')) : null;
                $User->canSeePostsAndImages = $request->input('canSeePostsAndImages');
                $User->canSeeBirthDate = $request->input('canSeeBirthDate');
                $User->gender = ($request->input('gender') != null) ? $request->input('gender') : null;
                $User->pronouns = ($request->input('pronouns') != null) ? $request->input('pronouns') : null;
                $User->isDark = ($request->input('isDark') != null) ? $request->input('isDark') : false;
                $User->work = ($request->input('work') != null) ? $request->input('work') : null;
                $User->school = ($request->input('school') != null) ? $request->input('school') : null;
            }
            if ($User->save()) {
                return response()->json(['message' => 'User Successfully Updated'], 200);
            }
            return response()->json(['message' => 'User To Update'], 404);
        }
        return response()->json(['message' => 'Wrong Password'], 401);
    }

    /**
     * It takes the email and birthDate from the request, then it searches for a user with the given
     * email and birthDate, and if it finds one, it generates a new email_verify string and sends it to
     * the user's email
     *
     * @param Request request The request object.
     *
     * @return The response is a JSON object with the following structure:
     */
    public function setNewVerify(Request $request)
    {
        $this->validate($request, [
            'email' => ['required', 'email'],
        ]);

        $User = User::where("email", $request->input('email'))->where("email_verified_at",null)->first();
        if ($User) {
            $User->email_verify = str_replace('/', '', substr(Hash::make((Str::uuid() . str_shuffle(md5($User->firstName . $User->lastName)) . Str::uuid())), 0, 512));
            if ($User->save()) {
                $middleName = "";
                if ($User->middleName) $middleName = $User->middleName . ' ';
                $owner = '' . $User->firstName . ' ' . $middleName . $User->lastName;
                $mailData = [
                    'subject' => 'Email verification',
                    'title' => 'Verfication resend',
                    'body' => 'Dear ' . $owner . '! You can verificate your email with the following link: ' . url("/emailVerification/" . $User->email_verify)
                ];

                Mail::to($User->email)->send(new SendMail($mailData));

                return response()->json(['message' => 'User verification sent!'], 200);
            }
            return response()->json(['message' => 'Verification link resend failed!'], 400);
        }
        return response()->json(['message' => 'User not found or verified'], 404);
    }

    /**
     * It takes a hash from the request, finds the user with that hash, sets the email_verified_at
     * field to the current time, sets the email_verify field to null, and saves the user
     *
     * @param Request request The request object.
     */
    public function getVerification(Request $request)
    {
        $this->validate($request, [
            'hash' => 'required',
        ]);
        $User = User::where("email_verify", $request->input('hash'))->first();
        if ($User) {
            $User->email_verified_at = Carbon::now();
            $User->email_verify = null;
            if ($User->save()) {
                return response()->json(['message' => 'User verified!'], 200);
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
     */
    public function forgottenSetNewPasswd(Request $request)
    {
        $this->validate($request, [
            'email' => 'required|email',
            'passwd' => 'required|string',
            'passwd2' => 'required|string',
            'hash' => 'required|string'
        ]);
        $User = User::where("email", $request->input('email'))->where('newPassHash', $request->input('newPassHash'))->first();
        $Passwd2 = base64_decode($request->input('passwd2'));
        $Passwd = base64_decode($request->input('password'));
        if (!preg_match('/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%?&.,-])(?=.*[a-zA-Z]).{8,}$/', $Passwd)) {
            return response()->json(['message' => 'Does not meet with the password requirements!'], 404);
        }
        if ($Passwd!=$Passwd2) {
            return response()->json(['message' => 'The 2 given password is not thew same!'], 404);
        }
        if ($User && $request->Passwd == $Passwd2) {
            if(Hash::make($Passwd)==$User->passwd){
                return response()->json(['message' => 'Your old password is the same as the new!'], 400);
            }
            $User->resetedPasswd = $User->passwd;
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
     * @return The response is a JSON object with a message property.
     */
    public function forgotten(Request $request)
    {
        $this->validate($request, [
            'email' => 'required|email',
        ]);
        $User = User::where("email", $request->input('email'))->first();
        if ($User) {
            $User->newPassHash = str_replace('/', '', substr(Hash::make((Str::uuid() . str_shuffle(md5($User->firstName . $User->lastName)) . Str::uuid())), 0, 512));
            if ($User->save())
                $middleName = "";
            if ($User->middleName) $middleName = $User->middleName . ' ';
            $owner = '' . $User->firstName . ' ' . $middleName . $User->lastName;
            $mailData = [
                'subject' => 'Password Reset',
                'title' => 'You or SOMEBODY asked for password reset',
                'body' => 'Dear ' . $owner . '! You can set a new password on this link, or log in to reset the hash: ' . url("/forgottenpassword/" . $User->newPassHash)
            ];

            Mail::to($User->email)->send(new SendMail($mailData)); {
                return response()->json(['message' => 'Hash generated!'], 200);
            }
            return response()->json(['message' => 'Did not added a emailHash!'], 400);
        }
        return response()->json(['message' => 'User not found'], 404);
    }

    /**
     * It takes the user id and the password and the new password and checks if the password is correct
     * and if the new password is not the same as the old password and if the new password is strong
     * enough and if all of that is true it updates the password.
     *
     * @param id The id of the user
     * @param Request request The request object.
     *
     * @return The response is being returned as a JSON object.
     */
    public function newPasswd($id, Request $request)
    {
        $this->validate($request, [
            'password' => 'required',
            'newPassword' => 'required',
        ]);
        $User = User::where("id", $id)->first();
        $NewPasswd = base64_decode($request->input('newPassword'));
        $Passwd = base64_decode($request->input('password'));
        if (!preg_match('/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%?&.,-])(?=.*[a-zA-Z]).{8,}$/', $Passwd)) {
            return response()->json(['message' => 'Does not meet with the password requirements!'], 404);
        }
            if ($User) {
                if (Hash::check($Passwd, $User->password)) {
                if ($NewPasswd != $Passwd) {
                    $User->resetedPasswd = $User->password;
                    $User->password = Hash::make($NewPasswd);
                    if ($User->save()) {
                        return response()->json(['message' => 'User Password Updated'], 200);
                    }
                    return response()->json(['message' => 'User To Update'], 404);
                }
                return response()->json(['message' => 'User Password Same As The Old Password'], 400);
            }
            return response()->json(['message' => 'Wrong Password'], 401);
        }
        return response()->json(['message' => 'User Not Found'], 404);
    }
    /**
     * It takes an id and a request, validates the request, finds the user, returns the user, and then if
     * the user exists, it updates the user's role, and if the user is not the current user, it returns a
     * message, and if the user is saved, it returns a message, and if the user is not saved, it returns a
     * message, and if the user is not found, it returns a message.
     *
     * @param id The id of the user you want to edit
     * @param Request request The request object.
     *
     * @return The user object is being returned.
     */

    public function editRole($id, Request $request)
    {
        $this->validate($request, [
            'role' => 'required',
        ]);
        $User = User::where("id", $id)->first();
        return $User;
        if ($User) {
            $User->role = $request->input('role');

            if (Auth::user()->id != $User->id) {
                return response()->json(['message' => 'You can not edit this!'], 400);
            }
            if ($User->save()) {
                return response()->json(['message' => 'User Role Successfully Updated'], 200);
            }
            return response()->json(['message' => 'User To Update'], 400);
        }
        return response()->json(['message' => 'User Not found'], 404);
    }

    /**
     * It's a function that updates the profile picture of a user
     *
     * @param id The id of the user
     * @param Request request The request object.
     *
     * @return The response is a JSON object with a message and a status code.
     */
    public function editProfileID($id, Request $request)
    {
        $this->validate($request, [
            'actualProfilePicID' => 'required',
            'place' => 'required',
            'uid' => 'required'
        ]);
        if ($request->input('place') != "user") return response()->json(['message' => 'Wrong input Data'], 403);
        $User = User::where("id", $id)->first();
        if (Auth::user()->id != $User->id) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        if ($request->input('actualProfilePicID') != 1) {
            $image = ProfilePic::where("place", $request->input('place'))->where("outsideID", $request->input('uid'))->where("id",  $request->input('actualProfilePicID'))->first();
            if ($image && $User) {
                $User->actualProfilePicID = $request->input('actualProfilePicID');
                if ($User->save()) {
                    return response()->json(['message' => 'User Wallpaper Successfully Updated'], 200);
                }
                return response()->json(['message' => 'User To Update'], 400);
            }
            return response()->json(['message' => 'User To Update'], 401);
        } else {
            if ($User) {
                $User->actualProfilePicID = $request->input('actualProfilePicID');
                if ($User->save()) {
                    return response()->json(['message' => 'User ProfilePicture Successfully Updated'], 200);
                }
                return response()->json(['message' => 'User To Update'], 400);
            }
            return response()->json(['message' => 'User Not found'], 404);
        }
    }

    /**
     * It checks if the user is the owner of the account, then checks if the wallpaper is the default
     * one, if not it checks if the wallpaper exists, if it does it updates the user's wallpaper
     *
     * @param id The id of the user you want to edit
     * @param Request request The request object.
     *
     * @return The response is a JSON object with a message and a status code.
     */
    public function editWallpaperID($id, Request $request)
    {
        $this->validate($request, [
            'actualWallPaperID' => 'required',
            'place' => 'required',
            'uid' => 'required'
        ]);
        if ($request->input('place') != "user") return response()->json(['message' => 'Wrong input Data'], 403);
        $User = User::where("id", $id)->first();
        if (Auth::user()->id != $User->id) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        if ($request->input('actualWallPaperID') != 1) {
            $image = WallPaper::where("place", $request->input('place'))->where("outsideID", $request->input('uid'))->where("id", $request->input('actualWallPaperID'))->first();
            if ($image && $User) {
                $User->actualWallPaperID = $request->input('actualWallPaperID');
                if ($User->save()) {
                    return response()->json(['message' => 'User ProfileWallpaper Successfully Updated'], 200);
                }
                return response()->json(['message' => 'User To Update'], 400);
            }
            return response()->json(['message' => 'User To Update'], 401);
        } else {
            if ($User) {
                $User->actualWallPaperID = $request->input('actualWallPaperID');
                if ($User->save()) {
                    return response()->json(['message' => 'User ProfileWallpaper Successfully Updated'], 200);
                }
                return response()->json(['message' => 'User To Update'], 400);
            }
            return response()->json(['message' => 'User Not found'], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id, $tag)
    {
        $deleteUser = User::where('id', $id)->where('tag', $tag)->first();
        if (Auth::user()->id != $deleteUser->id) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        if ($deleteUser) {
            PagesHelper::where('userID', $id)->where('rank', 3)->get()->map(function ($helper) {
                $Page = Page::where('id', $helper->pageID)->first();
                if ($Page) {
                    $Page->delete();
                }
            });
            EventsHelper::where('userID', $id)->where('role', 0)->get()->map(function ($helper) {
                $Event = Events::where('id', $helper->eventID)->first();
                if ($Event) {
                    $Event->delete();
                }
            });
            GroupMember::where('memberID', $id)->where('rank', 4)->get()->map(function ($helper) {
                $Group = Group::where('id', $helper->groupID)->first();
                if ($Group) {
                    $Group->delete();
                }
            });
            $deleteUser->delete();
            return response()->json(['message' => 'User Deleted'], 200);
        }
        return response()->json(['message' => 'User Not Found'], 404);
    }
}
