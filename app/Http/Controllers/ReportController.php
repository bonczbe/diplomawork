<?php

namespace App\Http\Controllers;

use App\Models\Comments;
use App\Models\GroupPostComment;
use App\Models\GroupPostImages;
use App\Models\GroupPostReply;
use App\Models\GroupPosts;
use App\Models\History;
use App\Models\PagePostComment;
use App\Models\PagesPost;
use App\Models\PagesPostImages;
use App\Models\PagesPostReply;
use App\Models\PostImage;
use App\Models\Report;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Supervisor;
use App\Models\Posts;
use App\Models\ProfilePic;
use App\Models\Reply;
use App\Models\WallPaper;

class ReportController extends Controller
{
    /**
     * It returns a collection of reports that have not been checked, and have been reported by more
     * than one user.
     *
     * @return A collection of objects.
     */
    public function index()
    {
        return Report::selectRaw('COUNT(userID) AS num_reports, CONCAT(type, outsideID) AS concated, MAX(type) AS type, MAX(outsideID) AS outsideID, MAX(id) AS id, MAX(userID) AS userID, MAX(checked) AS checked, MAX(whoChecked) AS whoChecked')
            ->groupBy('concated')
            ->havingRaw('SUM(checked) = 0')
            ->havingRaw('COUNT(userID) > 0')
            ->orderByRaw('(SELECT reportDate FROM reports r2 WHERE CONCAT(r2.type, r2.outsideID) = concated ORDER BY r2.reportDate LIMIT 14, 1) ASC')
            ->get();
    }

    /**
     * It returns the number of distinct groups of reports that have been checked by at least 15
     * different users.
     *
     * @return The number of groups that have been checked by at least 15 users.
     */
    public function CheckedNumber()
    {
        $admin = Supervisor::where('id', Auth::user()->id)->first();
        if (!Auth::check()||$admin->role!=2) return response()->json(['message' => 'Permission denied to store new Admin!'], 404);

        return Report::selectRaw('COUNT(userID) AS num_reports, CONCAT(type, outsideID) AS concated, MAX(type) AS type, MAX(outsideID) AS outsideID, MAX(id) AS id, MAX(userID) AS userID, MAX(checked) AS checked, MAX(whoChecked) AS whoChecked')
        ->groupBy('concated')
        ->havingRaw('SUM(checked) > 0')
        ->orderByRaw('(SELECT reportDate FROM reports r2 WHERE CONCAT(r2.type, r2.outsideID) = concated ORDER BY r2.reportDate LIMIT 14, 1) ASC')
        ->count();
    }
    /**
     * It returns the number of distinct groups of reports that have been checked by at least 15
     * different users.
     *
     * @return The number of groups that have been checked by at least 15 users.
     */
    public function UnCheckedNumber()
    {
        $admin = Supervisor::where('id', Auth::user()->id)->first();
        if (!Auth::check()||$admin->role!=2) return response()->json(['message' => 'Permission denied to store new Admin!'], 404);

        return Report::selectRaw('COUNT(userID) AS num_reports, CONCAT(type, outsideID) AS concated, MAX(type) AS type, MAX(outsideID) AS outsideID, MAX(id) AS id, MAX(userID) AS userID, MAX(checked) AS checked, MAX(whoChecked) AS whoChecked')
        ->groupBy('concated')
        ->havingRaw('SUM(checked) = 0')
        ->orderByRaw('(SELECT reportDate FROM reports r2 WHERE CONCAT(r2.type, r2.outsideID) = concated ORDER BY r2.reportDate LIMIT 14, 1) ASC')
        ->count();
    }

    /**
     * It returns a collection of reports that have been checked by a specific user, but have not been
     * checked by anyone else.
     * </code>
     *
     * @param userID The userID of the user who checked the report
     *
     * @return A collection of objects.
     */
    public function indexByChecked($userID)
    {
        $admin = Supervisor::where('id', Auth::user()->id)->first();
        if (!Auth::check()||$admin->role!=2) return response()->json(['message' => 'Permission denied to store new Admin!'], 404);
        return Report::selectRaw('COUNT(userID) AS num_reports, CONCAT(type, outsideID) AS concated, type, outsideID, id, userID, checked, whoChecked')
            ->where("whoChecked", $userID)
            ->groupBy('concated', 'type', 'outsideID', 'id', 'userID', 'checked', 'whoChecked')
            ->havingRaw('SUM(checked) = 0')
            ->get();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'outsideID' => 'required|integer',
            'type' => 'required|string',
            'userID' => 'required|integer'
        ]);
        if  (1== $request->input('outsideID')&&("wallPaper" == $request->input('type')||"profilePic" == $request->input('type'))) {
            return response()->json(['message' => 'You can not report this!'], 400);
        }
        $isChecked = Report::where('outsideID', $request->input('outsideID'))->where('checked', true)
            ->where('type', $request->input('type'))->first();
        if ($isChecked) {
            return response()->json(['message' => 'This content is checked by an admin an decided that this is safe!'], 401);
        }
        $exist = Report::where('outsideID', $request->input('outsideID'))->where('userID', $request->input('userID'))
            ->where('type', $request->input('type'))->first();
        if ($exist) {
            return response()->json(['message' => 'You have a report on this thing!'], 401);
        } else {
            $new = new Report;
            $new->outsideID = $request->input('outsideID');
            $new->type = $request->input('type');
            $new->userID = $request->input('userID');
            $new->reportDate = Carbon::now();
            if ($new->save()) {
                return $new;
            } else {
                return response()->json(['message' => 'Failed to save'], 400);
            }
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Report  $report
     * @return \Illuminate\Http\Response
     */
    public function show($outsideID, $userID, $type)
    {
        if (Auth::user()->id != $userID) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        $exist = Report::where('outsideID', $outsideID)->where('userID', $userID)
            ->where('type', $type)->first();
        $sumOfReports = Report::where('outsideID', $outsideID)->where('type', $type)->count();

        $collection = collect();
        return $collection->put('exist', $exist)->put('sumOfReports', $sumOfReports);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Report  $report
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $delete = Report::where('id', $id)->first();
        if (Auth::user()->id != $delete->userID) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        if ($delete->delete()) {
            return response()->json(['message' => 'Deleted'], 200);
        }
        return response()->json(['message' => 'Failed to delete'], 400);
    }

    /**
     * It deletes a record from the database based on the type of the record and the id of the record
     * 
     * @param Request request outsideID, type, userID
     * 
     * @return The response is being returned as a JSON object.
     */
    public function destroyFromSpecific(Request $request)
    {
        $this->validate($request, [
            'outsideID' => 'required|integer',
            'type' => 'required|string',
            'userID' => 'required|integer'
        ]);
        if (Auth::user()->id != $request->input('userID')) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        $deletedRows = Report::where('outsideID', $request->input('outsideID'))
            ->where('type', $request->input('type'))
            ->delete();
        if ($deletedRows > 0) {
            switch ($request->input("type")) {
                case 'normalPost':
                    Posts::where('id',$request->input('outsideID'))->delete();
                    break;
                case 'groupPost':
                    GroupPosts::where('id',$request->input('outsideID'))->delete();
                    break;
                case 'pagePost':
                    PagesPost::where('id',$request->input('outsideID'))->delete();
                    break;
                case 'normalComment':
                    Comments::where('id',$request->input('outsideID'))->delete();
                    break;
                case 'pageComment':
                    PagePostComment::where('id',$request->input('outsideID'))->delete();
                    break;
                case 'groupComment':
                    GroupPostComment::where('id',$request->input('outsideID'))->delete();
                    break;
                case 'normalReply':
                    Reply::where('id',$request->input('outsideID'))->delete();
                    break;
                case 'pageReply':
                    PagesPostReply::where('id',$request->input('outsideID'))->delete();
                    break;
                case 'groupReply':
                    GroupPostReply::where('id',$request->input('outsideID'))->delete();
                    break;
                case 'profilePic':
                    ProfilePic::where('id',$request->input('outsideID'))->delete();
                    break;
                case 'wallPaper':
                    WallPaper::where('id',$request->input('outsideID'))->delete();
                    break;
                case 'history':
                    History::where('id',$request->input('outsideID'))->delete();
                    break;
                case 'PostImage':
                    PostImage::where('id',$request->input('outsideID'))->delete();
                    break;
                case 'normalPostImage':
                    PostImage::where('id',$request->input('outsideID'))->delete();
                    break;
                case 'pagePostImage':
                    PagesPostImages::where('id',$request->input('outsideID'))->delete();
                    break;
                case 'groupPostImage':
                    GroupPostImages::where('id',$request->input('outsideID'))->delete();
                    break;
                default:
                    return response()->json(['message' => 'Type not found!'], 404);
            }
            return response()->json(['message' => 'Records deleted successfully.'], 200);
        } else {
            return response()->json(['message' => 'No matching records found.'], 404);
        }
    }
    /**
     * It updates the checked column to true and whoChecked column to the userID of the user who checked
     * it
     *
     * @param outsideID The ID of the post/comment/reply that was reported.
     * @param type The type of the report.
     * @param userID The user who is reporting the post
     *
     * @return The response is being returned as a JSON object.
     */
    public function checked(Request $request)
    {
        $this->validate($request, [
            'outsideID' => 'required|integer',
            'type' => 'required|string',
            'userID' => 'required|integer'
        ]);
        if (Auth::user()->id != $request->input('userID')) {
            return response()->json(['message' => 'You can not edit this!'], 400);
        }
        $deletedRows = Report::where('outsideID', $request->input('outsideID'))
            ->where('type', $request->input('type'))
            ->update(['checked' => true, 'whoChecked' => $request->input('userID')]);
        if ($deletedRows > 0) {
            return response()->json(['message' => 'Records updated successfully.'], 200);
        } else {
            return response()->json(['message' => 'No matching records found.'], 404);
        }
    }
}
