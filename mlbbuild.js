const mongoose = require('mongoose');

const Team = mongoose.model('Team');
const logger = require("log4js");
const Slats = require('../models/Slats');
const PlayerStats = require('../models/PlayerStats');
const SlatPlayers = require('../models/SlatPlayers');
const PlayerExposure = require('../models/PlayerExposure');
const PlayerPerTeam = require('../models/PlayerPerTeam');
const PlayerProjection = require('../models/PlayerProjection');
const CurrentSeason = mongoose.model('CurrentSeason');
const Schedule = mongoose.model('Schedule');
var dateTime = require('node-datetime');
const { ENOTEMPTY } = require('constants');
const moment = require('moment-timezone');
// moment.tz.add('America/New_York|EST EDT|50 40|0101|1Lz50 1zb0 Op0');
moment.tz.add("America/New_York|EST EDT EWT EPT|50 40 40 40|01010101010101010101010101010101010101010101010102301010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|-261t0 1nX0 11B0 1nX0 11B0 1qL0 1a10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 RB0 8x40 iv0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1cN0 1cL0 1cN0 1cL0 s10 1Vz0 LB0 1BX0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|21e6",);

var currentdate = moment().tz("America/New_York").format('YYYY-MM-DDT00:00:00');
// var currentdate = '2021-03-13T00:00:00'; 
// console.log('MLBbuild', currentdate);



module.exports.socket_create_build = async function (io, socket, req) {
    // exports.socket_create_build = async (req, res, next) => {
    try {

        let SS_Players = [];
        let P_Players = [];
        let OF_Players = [];
        let B1_Players = [];
        let C_Players = [];
        let B2_Players = [];
        let B3_Players = [];
        let complete = [];
        let allTeams = [];
        let All_Players = [];
        let teamArray = [];
        var currentdate = moment().tz("America/New_York").format('YYYY-MM-DDT00:00:00');

        let no_of_builds = 1500;
        let get_builds = req.NumberOfBuild;
        // let get_builds = 5;
        let positions = ["P", "P2", "OF", "C", "1B", "2B", "3B", "SS", "OF2", "OF3"];
        let gamepositions = ["P", "C", "1B", "2B", "3B", "SS", "OF"];
        let newPos = [0, 1, 3, 4, 5, 6, 7, 2, 8, 9];
        // let positions = ["G"];
        let SlateID = req.SlateID;
        let user = req.user;
        let operator = req.operator;
        let gametype = req.gametype;
        // console.log("user: ", user);
        // console.log("SlateID: ", SlateID);
        // console.log("NumberOfBuild: ", get_builds);  
        // let user = "603f1f85e9539b7d08bc7ed4";
        // let SlateID = 12283; 

        let actioncount = 0;

        const lockplayer = await PlayerExposure.find({ slatId: SlateID, user: user, type: "lock" });
        // console.log("lockplayer",lockplayer.length);
        if (lockplayer.length > 0) {
            actioncount = actioncount + lockplayer.length;
        }
        const excludeplayer = await PlayerExposure.find({ slatId: SlateID, user: user, type: "exclude" });
        // console.log("excludeplayer",excludeplayer.length);
        if (excludeplayer.length > 0) {
            actioncount = actioncount + excludeplayer.length;
        }
        const manualplayer = await PlayerExposure.find({ slatId: SlateID, user: user, type: "manual" });
        // console.log("manualplayer",manualplayer.length);
        if (manualplayer.length > 0) {
            actioncount = actioncount + manualplayer.length;
        }
        const stackplayer = await PlayerPerTeam.find({ slatId: SlateID, user: user });
        // console.log("stackplayer",stackplayer.length);
        if (stackplayer.length > 0) {
            let teamStack = stackplayer[0].teamStack;
            let teamStack_length = teamStack.length;
            for (let i = 0; i < teamStack_length; i++) {
                // console.log("TEams ", teamStack[i].teamId);
                if (teamStack[i].minNoOfPlayer > 0) {
                    actioncount = actioncount + teamStack[i].minNoOfPlayer;

                }
            }
        }
        // if(stackplayer.length > 0){
        //  actioncount = actioncount + 1;
        // }
        const projectionplayer = await PlayerProjection.find({ slatId: SlateID, user: user });
        // console.log("projectionplayer",projectionplayer.length);
        if (projectionplayer.length > 0) {
            actioncount = actioncount + projectionplayer.length;
        }

        // console.log("actioncount",actioncount);

        await PlayerExposure.find({ slatId: SlateID, user: user, type: "lock" })
            .then(async lockplayers => {
                await PlayerExposure.distinct("slatePlayerID", { slatId: SlateID, user: user, type: "exclude" })
                    .then(async exposureplayers => {
                        if (actioncount < 2) {

                            // return res.send({ status: 2, success: false, messages: "Please lock atleast one player" });
                            var response = {
                                status: 2, success: false, messages: "Please lock atleast one player"
                            }
                            socket.emit('mlbcreatebuild-success', response);
                        } else {

                            for (let k = 0; k < gamepositions.length; k++) {
                                let position = gamepositions[k];
                                // let count =0;
                                // console.log("position: ", position, " k: ", k);
                                await Slats.aggregate([{ "$match": { "SlateID": SlateID } },
                                { "$unwind": "$PlayerId" }, { "$unwind": "$PlayerId.OperatorRosterSlots" },
                                { "$match": { "PlayerId.OperatorRosterSlots": position } },
                                { "$project": { "PlayerId": "$PlayerId", "_id": 0 } }
                                ])
                                    .then(async result => {
                                        // console.log("resultlength: ", result[1]);
                                        let allPlayers = [];
                                        let playerslat = {};
                                        for (let i = 0; i < result.length; i++) {
                                            allPlayers[i] = result[i].PlayerId.PlayerID;
                                            playerslat[result[i].PlayerId.PlayerID] = {
                                                "sallary": result[i].PlayerId.OperatorSalary1,
                                                "slatid": result[i].PlayerId.OperatorSlatePlayerID
                                            }
                                        }
                                        // console.log( "length: ",allPlayers.length);, Day: { $eq: currentdate }
                                        // res.send({allPlayers});
                                        await PlayerStats.find({ PlayerID: { $in: allPlayers }, SportId: 2 }, {
                                            SportType: 1, SportId: 1, PlayerID: 1, DepthChartOrder: 1, Day: 1,
                                            DepthChartPosition: 1, DraftKingsName: 1, Name: 1, InjuryStatus: 1,
                                            InjuryStartDate: 1, InjuryBodyPart: 1, InjuryNotes: 1, DraftKingsProjection: 1, BattingOrder: 1,
                                            DraftKingsPosition: 1, HomeOrAway: 1, FandDualProjection: 1, FPPDdraftking: 1, FPPDfanduel: 1,
                                            PhotoUrl: 1, DraftKingsSalary: 1, FanDuelSalary: 1, Status: 1, TeamID: 1, FPPG: 1, FanDuelPosition: 1,
                                            DraftKingsVal: 1, FanDualVal: 1, Games: 1, FantasyPoints: 1, Team: 1, SlatePlayerID: 1, _id: 0
                                        })
                                            .then(async players => {
                                                // console.log("palyers.length: ", players.length);
                                                let i = 0;
                                                let n = 0;
                                                while (n < players.length) {

                                                    let doc = players[n];

                                                    let logo = await PlayerProjection.findOne({ playerId: doc.PlayerID, slatId: req.SlateID, user: req.user }, { projection: 1 });
                                                    // console.log("logo",logo);
                                                    if (logo != null) {
                                                        // console.log("logo",logo);
                                                        // console.log("logo",logo.projection);
                                                        // player = player.toJSON();
                                                        doc.DraftKingsProjection = logo.projection;
                                                        doc.FandDualProjection = logo.projection;
                                                    }

                                                    if (doc !== null && position != "P" && doc.DraftKingsSalary > 1 && doc.DraftKingsProjection > 0.1) {
                                                        if (doc.InjuryStatus !== "Out") {
                                                            if (playerslat[doc.PlayerID].slatid != "") {
                                                                doc["SlatePlayerID"] = playerslat[doc.PlayerID].slatid;
                                                            }
                                                            doc["DraftKingsSalary"] = playerslat[doc.PlayerID].sallary;
                                                            doc["FanDuelSalary"] = playerslat[doc.PlayerID].sallary;
                                                            var indexof = exposureplayers.indexOf(doc.SlatePlayerID);
                                                            if (indexof == -1) {

                                                                All_Players.push(doc);
                                                            }


                                                        }
                                                    }

                                                    if (doc !== null && position === "P" && doc.DraftKingsSalary > 1 && doc.DraftKingsProjection > 0.1) {
                                                        if (doc.InjuryStatus !== "Out") {
                                                            if (playerslat[doc.PlayerID].slatid != "") {
                                                                doc["SlatePlayerID"] = playerslat[doc.PlayerID].slatid;
                                                            }
                                                            doc["DraftKingsSalary"] = playerslat[doc.PlayerID].sallary;
                                                            doc["FanDuelSalary"] = playerslat[doc.PlayerID].sallary;
                                                            // console.log("doc: ", doc);
                                                            var indexof = exposureplayers.indexOf(doc.SlatePlayerID);
                                                            if (indexof == -1) {

                                                                P_Players.push(doc);
                                                            }

                                                        }
                                                    } else if (doc !== null && position === "C" && doc.DraftKingsSalary > 1 && doc.DraftKingsProjection > 0.1) {
                                                        if (doc.InjuryStatus !== "Out") {
                                                            if (playerslat[doc.PlayerID].slatid != "") {
                                                                doc["SlatePlayerID"] = playerslat[doc.PlayerID].slatid;
                                                            }
                                                            doc["DraftKingsSalary"] = playerslat[doc.PlayerID].sallary;
                                                            doc["FanDuelSalary"] = playerslat[doc.PlayerID].sallary;
                                                            // console.log("doc: ", doc);
                                                            var indexof = exposureplayers.indexOf(doc.SlatePlayerID);
                                                            if (indexof == -1) {

                                                                C_Players.push(doc);
                                                            }

                                                        }
                                                    } else if (doc !== null && position === "1B" && doc.DraftKingsSalary > 1 && doc.DraftKingsProjection > 0.1) {
                                                        if (doc.InjuryStatus !== "Out") {
                                                            if (playerslat[doc.PlayerID].slatid != "") {
                                                                doc["SlatePlayerID"] = playerslat[doc.PlayerID].slatid;
                                                            }
                                                            doc["DraftKingsSalary"] = playerslat[doc.PlayerID].sallary;
                                                            doc["FanDuelSalary"] = playerslat[doc.PlayerID].sallary;
                                                            // console.log("doc: ", doc);
                                                            var indexof = exposureplayers.indexOf(doc.SlatePlayerID);
                                                            if (indexof == -1) {

                                                                B1_Players.push(doc);
                                                            }

                                                        }

                                                    } else if (doc !== null && position === "2B" && doc.DraftKingsSalary > 1 && doc.DraftKingsProjection > 0.1) {
                                                        if (doc.InjuryStatus !== "Out") {
                                                            if (playerslat[doc.PlayerID].slatid != "") {
                                                                doc["SlatePlayerID"] = playerslat[doc.PlayerID].slatid;
                                                            }
                                                            doc["DraftKingsSalary"] = playerslat[doc.PlayerID].sallary;
                                                            doc["FanDuelSalary"] = playerslat[doc.PlayerID].sallary;
                                                            // console.log("doc: ", doc);
                                                            var indexof = exposureplayers.indexOf(doc.SlatePlayerID);
                                                            if (indexof == -1) {

                                                                B2_Players.push(doc);
                                                            }

                                                        }
                                                    } else if (doc !== null && position === "3B" && doc.DraftKingsSalary > 1 && doc.DraftKingsProjection > 0.1) {
                                                        if (doc.InjuryStatus !== "Out") {
                                                            if (playerslat[doc.PlayerID].slatid != "") {
                                                                doc["SlatePlayerID"] = playerslat[doc.PlayerID].slatid;
                                                            }
                                                            doc["DraftKingsSalary"] = playerslat[doc.PlayerID].sallary;
                                                            doc["FanDuelSalary"] = playerslat[doc.PlayerID].sallary;
                                                            // console.log("doc: ", doc);
                                                            var indexof = exposureplayers.indexOf(doc.SlatePlayerID);
                                                            if (indexof == -1) {

                                                                B3_Players.push(doc);
                                                            }

                                                        }
                                                    } else if (doc !== null && position === "SS" && doc.DraftKingsSalary > 1 && doc.DraftKingsProjection > 0.1) {
                                                        // G_Players = PG_Players.concat(SG_Players);
                                                        if (doc.InjuryStatus !== "Out") {
                                                            if (playerslat[doc.PlayerID].slatid != "") {
                                                                doc["SlatePlayerID"] = playerslat[doc.PlayerID].slatid;
                                                            }
                                                            doc["DraftKingsSalary"] = playerslat[doc.PlayerID].sallary;
                                                            doc["FanDuelSalary"] = playerslat[doc.PlayerID].sallary;
                                                            // console.log("doc: ", doc);
                                                            var indexof = exposureplayers.indexOf(doc.SlatePlayerID);
                                                            if (indexof == -1) {

                                                                SS_Players.push(doc);
                                                            }

                                                        }
                                                    } else if (doc !== null && position === "OF" && doc.DraftKingsSalary > 1 && doc.DraftKingsProjection > 0.1) {
                                                        if (doc.InjuryStatus !== "Out") {
                                                            if (playerslat[doc.PlayerID].slatid != "") {
                                                                doc["SlatePlayerID"] = playerslat[doc.PlayerID].slatid;
                                                            }
                                                            doc["DraftKingsSalary"] = playerslat[doc.PlayerID].sallary;
                                                            doc["FanDuelSalary"] = playerslat[doc.PlayerID].sallary;
                                                            // console.log("doc: ", doc);
                                                            var indexof = exposureplayers.indexOf(doc.SlatePlayerID);
                                                            if (indexof == -1) {

                                                                OF_Players.push(doc);
                                                            }

                                                        }
                                                    }

                                                    n++;
                                                }
                                            })
                                        // res.send({players});
                                        // })
                                    })
                                    .catch(error => {
                                        // console.log("error: ", error);
                                        res.send({ error });
                                    })
                            }

                            All_Players = Array.from(new Set(All_Players.map(a => a.PlayerID)))
                                .map(PlayerID => {
                                    return All_Players.find(a => a.PlayerID === PlayerID)
                                })

                            // console.log("All_NewPlayers", P_Players.length);



                            let LockedTeams = {};
                            let alockedPlayers = [];
                            let stackPlayers = [];
                            let SecondstackPlayers = [];
                            let exposurePlayer = {};
                            let excludePlayers = [];
                            let no_of_player = 0;
                            let orderstatus = 2;
                            await PlayerPerTeam.find({ slatId: SlateID, user: user })
                                .then(async teams => {
                                    // console.log("TEams ", teams);
                                    if (teams.length > 0) {
                                        let teamStack = teams[0].teamStack;
                                        let batterorder = teams[0].batterorder;
                                        teamStack = teamStack.filter(item => item.minNoOfPlayer > 0);
                                        teamStack = teamStack.sort((a, b) => {
                                            return (b.order - a.order)
                                        })
                                        // console.log("TEams ", teamStack);
                                        let teamStack_length = teamStack.length;

                                        for (let i = 0; i < teamStack_length; i++) {

                                            // console.log("TEams ", teams[0].orderstatus, teams[0].batterorder,);
                                            // console.log("TEams ", teamStack[i].teamId, teamStack[i].minNoOfPlayer);
                                            if (teamStack[i].minNoOfPlayer > 0) {
                                                orderstatus = teams[0].orderstatus;
                                                // console.log("TEams ", orderstatus, batterorder,);
                                                // console.log("TEams ", teamStack[i].teamId, teamStack[i].HomeCheckbox, teamStack[i].AwayCheckbox);
                                                let isbatterOrder = teamStack[i].HomeCheckbox;
                                                // console.log("isbatterOrder",isbatterOrder);
                                                if (isbatterOrder == undefined) {
                                                    // console.log("enter");
                                                    isbatterOrder = teamStack[i].AwayCheckbox;
                                                }
                                                // console.log("isbatterOrder2222", isbatterOrder);
                                                let Allteam_Players = All_Players.filter(item => item.TeamID == teamStack[i].teamId);
                                                if (isbatterOrder == true) {
                                                    Allteam_Players = Allteam_Players.sort((a, b) => {
                                                        return (a.BattingOrder - b.BattingOrder)
                                                    })
                                                } else {
                                                    Allteam_Players = Allteam_Players.sort((a, b) => {
                                                        return (b.DraftKingsProjection - a.DraftKingsProjection)
                                                    })
                                                }

                                                // console.log("players", teamStack[i].teamId, Allteam_Players.length, teamStack[i].minNoOfPlayer);
                                                // console.log(lockedPlayers.length);
                                                if (stackPlayers.length == 0) {
                                                    no_of_player = teamStack[i].minNoOfPlayer;
                                                    // console.log("enter 1");

                                                    if (isbatterOrder == true) {
                                                        no_player = teamStack[i].minNoOfPlayer;
                                                    } else {
                                                        no_player = teamStack[i].minNoOfPlayer + 1;
                                                    }
                                                    for (let j = 0; j < no_player; j++) {
                                                        if (isbatterOrder == true) {
                                                            no = batterorder[j] - 1;
                                                        } else {
                                                            no = j;
                                                        }
                                                        // console.log(j, no, batterorder[j]);
                                                        // console.log(j,no,batterorder[j], Allteam_Players[no].Name, Allteam_Players[no].TeamID,Allteam_Players[no].PlayerID,Allteam_Players[no].BattingOrder, Allteam_Players[no].DraftKingsProjection);
                                                        exposurePlayer[Allteam_Players[no].PlayerID] = 1500;
                                                        stackPlayers.push(Allteam_Players[no]);

                                                    }

                                                } else {

                                                    // console.log("enter 2");

                                                    if (isbatterOrder == true) {
                                                        // console.log("enter 3");
                                                        // no_of_player = teamStack[i].minNoOfPlayer;
                                                        for (let j = 0; j < teamStack[i].minNoOfPlayer; j++) {
                                                            no = batterorder[j] - 1;
                                                            // console.log(j, no, batterorder[j]);
                                                            // console.log(j,no,batterorder[j], Allteam_Players[no].Name, Allteam_Players[no].TeamID,Allteam_Players[no].PlayerID,Allteam_Players[no].BattingOrder, Allteam_Players[no].DraftKingsProjection);
                                                            exposurePlayer[Allteam_Players[no].PlayerID] = 1500;
                                                            SecondstackPlayers.push(Allteam_Players[no]);
                                                        }
                                                    } else {

                                                        Allteam_Players = Allteam_Players.filter(item => item.DraftKingsSalary <= 4000);
                                                        // console.log("enter 4",Allteam_Players.length);
                                                        for (let j = 0; j < 20; j++) {
                                                            let n = Math.floor(Math.random() * Math.floor(Allteam_Players.length));
                                                            // console.log(n, Allteam_Players[n].Name, Allteam_Players[n].PlayerID, Allteam_Players[n].DraftKingsSalary, Allteam_Players[n].DraftKingsProjection);
                                                            var indexof = SecondstackPlayers.indexOf(Allteam_Players[n]);
                                                            if (indexof == -1) {
                                                                exposurePlayer[Allteam_Players[n].PlayerID] = 1500;
                                                                SecondstackPlayers.push(Allteam_Players[n]);
                                                            }
                                                            if (SecondstackPlayers.length >= teamStack[i].minNoOfPlayer) {
                                                                j = 20;
                                                            }
                                                        }
                                                    }
                                                }

                                                LockedTeams[teamStack[i].teamId] = teamStack[i].minNoOfPlayer;


                                            }
                                        }
                                    }
                                })
                                .catch(error => {
                                    // console.log("player per team error", error);
                                    // logger.error("Playerper team" + JSON.stringify(error));

                                })

                            // console.log("Player Per Team Lockeduserteam: ", Lockeduserteam);
                            // console.log("Player Per Team: ", LockedTeams);

                            if (SecondstackPlayers) {
                                alockedPlayers = alockedPlayers.concat(SecondstackPlayers);
                            }


                            await PlayerExposure.find({ slatId: SlateID, user: user, type: "exclude" })
                                .then(async players => {
                                    let exclude_length = players.length;
                                    for (let i = 0; i < exclude_length; i++) {
                                        await PlayerStats.findOne({ PlayerID: players[i].playerId },
                                            {
                                                SportType: 1, SportId: 1, PlayerID: 1, DepthChartOrder: 1,
                                                DepthChartPosition: 1, DraftKingsName: 1, Name: 1, InjuryStatus: 1,
                                                InjuryStartDate: 1, InjuryBodyPart: 1, InjuryNotes: 1, DraftKingsProjection: 1, BattingOrder: 1,
                                                DraftKingsPosition: 1, HomeOrAway: 1, FandDualProjection: 1, FPPDdraftking: 1, FPPDfanduel: 1,
                                                PhotoUrl: 1, DraftKingsSalary: 1, FanDuelSalary: 1, Status: 1, TeamID: 1, FPPG: 1, FanDuelPosition: 1,
                                                DraftKingsVal: 1, FanDualVal: 1, Games: 1, FantasyPoints: 1, Team: 1, SlatePlayerID: 1, _id: 0
                                            })
                                            .then(async doc => {
                                                if (players[i].slatePlayerID != "") {
                                                    doc["SlatePlayerID"] = players[i].slatePlayerID;
                                                }

                                                let logo = await PlayerProjection.findOne({ playerId: doc.PlayerID, slatId: req.SlateID, user: req.user }, { projection: 1 });
                                                // console.log("logo",logo);
                                                if (logo != null) {
                                                    // console.log("logo",logo);
                                                    // console.log("logo",logo.projection);
                                                    // player = player.toJSON();
                                                    doc.DraftKingsProjection = logo.projection;
                                                    doc.FandDualProjection = logo.projection;
                                                }

                                                doc["DraftKingsSalary"] = players[i].sallary;
                                                doc["FanDuelSalary"] = players[i].sallary;

                                                excludePlayers.push(doc);

                                            })
                                    }


                                })
                                .catch(error => {
                                    // console.log("exclude data find error");
                                })

                            // console.log("exclude players array: ", excludePlayers);

                            await PlayerExposure.find({ slatId: SlateID, user: user, type: { $ne: "exclude" } })
                                .then(async players => {
                                    let exclude_length = players.length;
                                    // console.log("exclude locked length",exclude_length);
                                    for (let i = 0; i < exclude_length; i++) {

                                        if (players[i].type == "lock") {

                                            exposurePlayer[players[i].playerId] = 1500;

                                        } else {

                                            var totalper = 0;
                                            if (players[i].min > players[i].max) {
                                                totalper = players[i].min;
                                            } else {
                                                totalper = players[i].max;
                                            }

                                            // console.log("totalper",players[i].playerId,totalper);

                                            let inlineup = Math.round(Math.abs(totalper / 10));
                                            inlineup = (inlineup * get_builds) / 10;
                                            exposurePlayer[players[i].playerId] = Math.round(inlineup);
                                        }



                                        // exposurePlayer.push(inlineCount);
                                        await PlayerStats.findOne({ PlayerID: players[i].playerId },
                                            {
                                                SportType: 1, SportId: 1, PlayerID: 1, DepthChartOrder: 1,
                                                DepthChartPosition: 1, DraftKingsName: 1, Name: 1, InjuryStatus: 1, BattingOrder: 1,
                                                InjuryStartDate: 1, InjuryBodyPart: 1, InjuryNotes: 1, DraftKingsProjection: 1,
                                                DraftKingsPosition: 1, HomeOrAway: 1, FandDualProjection: 1, FPPDdraftking: 1, FPPDfanduel: 1,
                                                PhotoUrl: 1, DraftKingsSalary: 1, FanDuelSalary: 1, Status: 1, TeamID: 1, FPPG: 1, FanDuelPosition: 1,
                                                DraftKingsVal: 1, FanDualVal: 1, Games: 1, FantasyPoints: 1, Team: 1, SlatePlayerID: 1, _id: 0
                                            })
                                            .then(async doc => {
                                                if (players[i].slatePlayerID != "") {
                                                    doc["SlatePlayerID"] = players[i].slatePlayerID;
                                                }

                                                let logo = await PlayerProjection.findOne({ playerId: doc.PlayerID, slatId: req.SlateID, user: req.user }, { projection: 1 });
                                                // console.log("logo",logo);
                                                if (logo != null) {
                                                    // console.log("logo",logo);
                                                    // console.log("logo",logo.projection);
                                                    // player = player.toJSON();
                                                    doc.DraftKingsProjection = logo.projection;
                                                    doc.FandDualProjection = logo.projection;
                                                }

                                                alockedPlayers.push(doc);

                                            })
                                    }


                                })
                                .catch(error => {
                                    // console.log("exclude locked data find error");
                                })


                            let playerByPosition = {};
                            let isLineUpCreated = await SlatPlayers.findOne({ SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, { SportId: 1 });
                            console.log("logo", isLineUpCreated);

                            playerByPosition.P = P_Players;
                            playerByPosition.C = C_Players;
                            playerByPosition.SS = SS_Players;
                            playerByPosition.OF = OF_Players;
                            playerByPosition.B1 = B1_Players;
                            playerByPosition.B2 = B2_Players;
                            playerByPosition.B3 = B3_Players;
                            playerByPosition.All = All_Players;
                            playerByPosition.Lock = alockedPlayers;
                            playerByPosition.Exclude = excludePlayers;
                            playerByPosition.Exposure = exposurePlayer;

                            if (isLineUpCreated != null) {

                                const slatPlayerData = {
                                    Players: playerByPosition,
                                }
                                await SlatPlayers.update({SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, slatPlayerData, (error, doc) => {
                                    if (error || !doc) {
                                        console.log("mlb DB error : Slat data update error");
                                    }
                                    else {
                                        console.log("mlb Player data update");
                                    }
                                })
                            } else {
                                const slatPlayerData = new SlatPlayers({
                                    SportType: "MLB",
                                    SportId: "2",
                                    SlatID: req.SlateID,
                                    UserId: req.user,
                                    Players: playerByPosition,

                                })
                                await slatPlayerData.save((error, doc) => {
                                    if (error || !doc) {
                                        console.log(error);
                                    }
                                    else {
                                        console.log("mlb mlb player data added");
                                    }
                                });
                            }

                            // console.log("Locked players array: ",orderstatus, alockedPlayers);
                            // lockedPlayers = lockedPlayers.concat(stackPlayers);
                            // console.log("Exposure players array: ", exposurePlayer,lockedPlayers);

                            let complete_team = 0;
                            let count = 0;
                            let reqsalary = 49000;
                            let teamcreate = 0;
                            let l = 1;
                            for (let j = 0; j <= no_of_builds; j++) {
                                let team = [];
                                let select_player = [];
                                let teamCount = 1;
                                let salary = 50000;
                                // console.log("Player Per Team: ",no_of_player);
                                if (orderstatus == 1) {
                                    if (stackPlayers.length > 0) {
                                        select_player = stackPlayers;
                                    }
                                } else if (orderstatus == 0) {
                                    if (stackPlayers.length > 0) {
                                        for (let p = 0; p < 20; p++) {
                                            let n = Math.floor(Math.random() * Math.floor(no_of_player + 1));
                                            // console.log(p,n);
                                            var indexof = select_player.indexOf(stackPlayers[n]);
                                            if (indexof == -1) {
                                                // console.log("player", n);
                                                select_player.push(stackPlayers[n]);
                                            }

                                            if (select_player.length >= no_of_player) {
                                                p = 20;
                                            }
                                        }
                                    }
                                }
                                let lockedPlayers = alockedPlayers.concat(select_player);
                                // console.log("select_player.lentgh: ",select_player.length,lockedPlayers.length); 
                                for (let k = 0; k < positions.length; k++) {
                                    let position = positions[k];

                                    // console.log("position: ", position, " k: ", k, "j:", j);
                                    // let count =0;
                                    if (position === "P") {
                                        P_Players = P_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                            .includes(JSON.stringify(elm)));

                                        // PG_Players = PG_Players.filter(val => !excludePlayers.includes(val));

                                        P_Players = P_Players.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection);
                                        });

                                        let length = lockedPlayers.length;
                                        let sucess = 0;
                                        let playerCount = {};
                                        for (let i = 0; i < length;) {
                                            if (P_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                                // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                                if (j != 0) {
                                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                                    if (!playerCount) {
                                                        newcount = 0;
                                                    } else {
                                                        newcount = playerCount.count;
                                                    }
                                                    // console.log("Count",playerCount);
                                                    // console.log("onlyCount", newcount);
                                                    if (newcount < playerexpo) {
                                                        // console.log("enter");
                                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                        i = length;
                                                        continue;
                                                    } else {
                                                        // console.log("not enter");
                                                        // sucess =  firstPLayer(teamArray, PG_Players, team, k, LockedTeams, position);
                                                        // i = length;
                                                        i++;
                                                        continue;

                                                    }

                                                } else {
                                                    // console.log("nlockfirst");
                                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                    i = length;
                                                    continue;
                                                }


                                            }
                                            else {
                                                // console.log("no");
                                                i++;
                                            }
                                        }

                                        // console.log("sucess1",sucess);

                                        if (sucess == 0) {
                                            // console.log("PG_sucessPlayers");
                                            // console.log("PG_Players",PG_Players);
                                            sucess = firstPLayerpitcher(teamArray, P_Players, team, k, LockedTeams, position);
                                        }

                                        // console.log("sucess",sucess);

                                    }

                                    if (position === "P2") {
                                        P_Players = P_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                            .includes(JSON.stringify(elm)));

                                        // SG_Players = SG_Players.filter(val => !excludePlayers.includes(val));

                                        P_Players = P_Players.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection);
                                        });

                                        let teamSalary = team.reduce((acc, item) => {
                                            // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                            return acc + item.DraftKingsSalary;
                                        }, 0);
                                        let lastPlayerSal = (Math.abs(50000 - teamSalary) / 9);
                                        // console.log("last player sal In SG: ", lastPlayerSal);

                                        let length = lockedPlayers.length;
                                        let sucess = 0;
                                        for (let i = 0; i < length;) {
                                            if (P_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                                // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                                if (j != 0) {
                                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                                    if (!playerCount) {
                                                        newcount = 0;
                                                    } else {
                                                        newcount = playerCount.count;
                                                    }
                                                    // console.log("Count",playerCount);
                                                    // console.log("onlyCount", newcount);
                                                    if (newcount < playerexpo) {
                                                        // console.log("enter");
                                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                        i = length;
                                                        continue;
                                                    } else {
                                                        // console.log("not enter");
                                                        // sucess =  addtolineup(teamArray, SG_Players, team, k, LockedTeams, position);
                                                        // i = length;
                                                        i++;
                                                        continue;

                                                    }

                                                } else {
                                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                    i = length;
                                                    continue;
                                                }

                                            }
                                            else {
                                                // console.log("no");
                                                i++;
                                            }
                                        }

                                        // console.log("sucess1",sucess);

                                        if (sucess == 0) {
                                            // console.log("SG_sucessPlayers");
                                            // console.log("PG_Players",PG_Players);
                                            sucess = addtolineuppitcher(teamArray, P_Players, team, k, LockedTeams, lastPlayerSal, position);

                                        }

                                        if (sucess == null) {
                                            // console.log("sucess second in SG",sucess);
                                            sucess = randomplayer(teamArray, P_Players, team, k, LockedTeams, lastPlayerSal, position);
                                        }

                                        // console.log("sucess",sucess);

                                    }

                                    if (position === "C") {
                                        C_Players = C_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                            .includes(JSON.stringify(elm)));

                                        // C_Players = C_Players.filter(val => !excludePlayers.includes(val));

                                        C_Players = C_Players.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection);
                                        });

                                        let teamSalary = team.reduce((acc, item) => {
                                            // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                            return acc + item.DraftKingsSalary;
                                        }, 0);
                                        let lastPlayerSal = (Math.abs(50000 - teamSalary) / 7);
                                        // console.log("last player sal In C: ", lastPlayerSal);

                                        let length = lockedPlayers.length;
                                        let sucess = 0;
                                        for (let i = 0; i < length;) {
                                            if (C_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                                // console.log("yes", exposurePlayer[lockedPlayers[i].PlayerID]);
                                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                                if (j != 0) {
                                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                                    if (!playerCount) {
                                                        newcount = 0;
                                                    } else {
                                                        newcount = playerCount.count;
                                                    }
                                                    // console.log("Count",playerCount);
                                                    // console.log("onlyCount", newcount);
                                                    if (newcount < playerexpo) {
                                                        // console.log("enter");
                                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                        i = length;
                                                        continue;
                                                    } else {

                                                        i++;
                                                        continue;

                                                    }

                                                } else {

                                                    // console.log("team",team);
                                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                    // console.log("sucess in lock", sucess);
                                                    i = length;
                                                    continue;
                                                }

                                            }
                                            else {
                                                // console.log("no");
                                                i++;
                                            }
                                        }

                                        // console.log("sucess1",sucess);

                                        if (sucess == 0) {
                                            // console.log("C_sucessPlayers");

                                            if (lastPlayerSal > 7000) {
                                                sucess = lastPlayer(teamArray, C_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            } else if (lastPlayerSal < 3500) {
                                                sucess = takelowplayer(teamArray, C_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            } else {
                                                sucess = addtolineup(teamArray, C_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            }

                                            // if (lastPlayerSal > 7000) {
                                            //     sucess = lastPlayer(teamArray, C_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            // }
                                            // else {
                                            //     sucess = addtolineup(teamArray, C_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            // }

                                        }

                                        if (sucess == null) {
                                            // console.log("sucess second in SG",sucess);
                                            sucess = randomplayer(teamArray, C_Players, team, k, LockedTeams, lastPlayerSal, position);
                                        }

                                        // console.log("sucess",sucess);
                                    }

                                    if (position === "1B") {
                                        B1_Players = B1_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                            .includes(JSON.stringify(elm)));

                                        // SG_Players = SG_Players.filter(val => !excludePlayers.includes(val));

                                        B1_Players = B1_Players.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection);
                                        });

                                        let teamSalary = team.reduce((acc, item) => {
                                            // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                            return acc + item.DraftKingsSalary;
                                        }, 0);
                                        let lastPlayerSal = (Math.abs(50000 - teamSalary) / 6);
                                        // console.log("last player sal In SG: ", lastPlayerSal);

                                        let length = lockedPlayers.length;
                                        let sucess = 0;
                                        for (let i = 0; i < length;) {
                                            if (B1_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                                // console.log("yes", exposurePlayer[lockedPlayers[i].PlayerID], lockedPlayers[i].PlayerID);
                                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                                if (j != 0) {
                                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                                    if (!playerCount) {
                                                        newcount = 0;
                                                    } else {
                                                        newcount = playerCount.count;
                                                    }
                                                    // console.log("Count",playerCount);
                                                    // console.log("onlyCount", newcount);
                                                    if (newcount < playerexpo) {
                                                        // console.log("enter");
                                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                        i = length;
                                                        continue;
                                                    } else {
                                                        // console.log("not enter");
                                                        // sucess =  addtolineup(teamArray, SG_Players, team, k, LockedTeams, position);
                                                        // i = length;
                                                        i++;
                                                        continue;

                                                    }

                                                } else {
                                                    // console.log("enter1");
                                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                    i = length;
                                                    continue;
                                                }

                                            }
                                            else {
                                                // console.log("no");
                                                i++;
                                            }
                                        }

                                        // console.log("sucess1",sucess);

                                        if (sucess == 0) {
                                            // console.log("SG_sucessPlayers");
                                            // console.log("PG_Players",PG_Players);
                                            if (lastPlayerSal > 6500) {
                                                sucess = lastPlayer(teamArray, B1_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            } else if (lastPlayerSal < 3500) {
                                                sucess = takelowplayer(teamArray, B1_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            } else {
                                                sucess = addtolineup(teamArray, B1_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            }
                                            // sucess = addtolineup(teamArray, B1_Players, team, k, LockedTeams, lastPlayerSal, position);

                                        }

                                        if (sucess == null) {
                                            // console.log("sucess second in SG",sucess);
                                            sucess = randomplayer(teamArray, B1_Players, team, k, LockedTeams, lastPlayerSal, position);
                                        }

                                        // console.log("sucess",sucess);

                                    }

                                    if (position === "2B") {
                                        B2_Players = B2_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                            .includes(JSON.stringify(elm)));

                                        // SG_Players = SG_Players.filter(val => !excludePlayers.includes(val));

                                        B2_Players = B2_Players.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection);
                                        });

                                        let teamSalary = team.reduce((acc, item) => {
                                            // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                            return acc + item.DraftKingsSalary;
                                        }, 0);
                                        let lastPlayerSal = (Math.abs(50000 - teamSalary) / 5);
                                        // console.log("last player sal In SG: ", lastPlayerSal);

                                        let length = lockedPlayers.length;
                                        let sucess = 0;
                                        for (let i = 0; i < length;) {
                                            if (B2_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                                // console.log("yes", exposurePlayer[lockedPlayers[i].PlayerID]);
                                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                                if (j != 0) {
                                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                                    if (!playerCount) {
                                                        newcount = 0;
                                                    } else {
                                                        newcount = playerCount.count;
                                                    }
                                                    // console.log("Count",playerCount);
                                                    // console.log("onlyCount", newcount);
                                                    if (newcount < playerexpo) {
                                                        // console.log("enter");
                                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                        i = length;
                                                        continue;
                                                    } else {
                                                        // console.log("not enter");
                                                        // sucess =  addtolineup(teamArray, SG_Players, team, k, LockedTeams, position);
                                                        // i = length;
                                                        i++;
                                                        continue;

                                                    }

                                                } else {
                                                    // console.log("enter2");
                                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                    i = length;
                                                    continue;
                                                }

                                            }
                                            else {
                                                // console.log("no");
                                                i++;
                                            }
                                        }

                                        // console.log("sucess1",sucess);

                                        if (sucess == 0) {
                                            // console.log("SG_sucessPlayers");
                                            // console.log("PG_Players",PG_Players);
                                            if (lastPlayerSal > 6500) {
                                                sucess = lastPlayer(teamArray, B2_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            } else if (lastPlayerSal < 3500) {
                                                sucess = takelowplayer(teamArray, B2_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            } else {
                                                sucess = addtolineup(teamArray, B2_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            }
                                            // sucess = addtolineup(teamArray, B2_Players, team, k, LockedTeams, lastPlayerSal, position);

                                        }

                                        if (sucess == null) {
                                            // console.log("sucess second in SG",sucess);
                                            sucess = randomplayer(teamArray, B2_Players, team, k, LockedTeams, lastPlayerSal, position);
                                        }

                                        // console.log("sucess",sucess);

                                    }

                                    if (position === "3B") {
                                        B3_Players = B3_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                            .includes(JSON.stringify(elm)));

                                        // SF_Players = SF_Players.filter(val => !excludePlayers.includes(val));

                                        B3_Players = B3_Players.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection);
                                        });

                                        let teamSalary = team.reduce((acc, item) => {
                                            // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                            return acc + item.DraftKingsSalary;
                                        }, 0);
                                        let lastPlayerSal = (Math.abs(50000 - teamSalary) / 4);
                                        // console.log("last player sal In SF: ", lastPlayerSal);

                                        let length = lockedPlayers.length;
                                        let sucess = 0;
                                        for (let i = 0; i < length;) {
                                            if (B3_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                                // console.log("yes", exposurePlayer[lockedPlayers[i].PlayerID]);
                                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                                if (j != 0) {
                                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                                    if (!playerCount) {
                                                        newcount = 0;
                                                    } else {
                                                        newcount = playerCount.count;
                                                    }
                                                    // console.log("Count",playerCount);
                                                    // console.log("onlyCount", newcount);
                                                    if (newcount < playerexpo) {
                                                        // console.log("enter");
                                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                        i = length;
                                                        continue;
                                                    } else {
                                                        // console.log("not enter");
                                                        // sucess =  addtolineup(teamArray, SF_Players, team, k, LockedTeams, position);
                                                        // i = length;
                                                        i++;
                                                        continue;

                                                    }

                                                } else {
                                                    // console.log("enter2");
                                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                    i = length;
                                                    continue;
                                                }
                                            }
                                            else {
                                                // console.log("no",i);
                                                i++;
                                            }
                                        }

                                        // console.log("sucess1",sucess);

                                        if (sucess == 0) {
                                            // console.log("SF_sucessPlayers");
                                            // console.log("PG_Players",PG_Players);
                                            if (lastPlayerSal > 6500) {
                                                sucess = lastPlayer(teamArray, B3_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            } else if (lastPlayerSal < 3500) {
                                                sucess = takelowplayer(teamArray, B3_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            } else {
                                                sucess = addtolineup(teamArray, B3_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            }
                                            // sucess = addtolineup(teamArray, B3_Players, team, k, LockedTeams, lastPlayerSal, position);
                                        }

                                        if (sucess == null) {
                                            // console.log("sucess second in SG",sucess);
                                            sucess = randomplayer(teamArray, B3_Players, team, k, LockedTeams, lastPlayerSal, position);
                                        }

                                        // console.log("sucess",sucess);

                                    }

                                    if (position === "SS") {
                                        SS_Players = SS_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                            .includes(JSON.stringify(elm)));

                                        // PF_Players = PF_Players.filter(val => !excludePlayers.includes(val));

                                        SS_Players = SS_Players.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection);
                                        });

                                        let teamSalary = team.reduce((acc, item) => {
                                            // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                            return acc + item.DraftKingsSalary;
                                        }, 0);
                                        let lastPlayerSal = (Math.abs(50000 - teamSalary) / 3);
                                        // console.log("last player sal In PF: ", lastPlayerSal);

                                        let length = lockedPlayers.length;
                                        let sucess = 0;
                                        for (let i = 0; i < length;) {
                                            // console.log("yes enter",i);
                                            if (SS_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                                // console.log("yes", exposurePlayer[lockedPlayers[i].PlayerID]);
                                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                                if (j != 0) {
                                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                                    if (!playerCount) {
                                                        newcount = 0;
                                                    } else {
                                                        newcount = playerCount.count;
                                                    }
                                                    // console.log("Count",playerCount);
                                                    // console.log("onlyCount", newcount);
                                                    if (newcount < playerexpo) {
                                                        // console.log("enter");
                                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                        i = length;
                                                        continue;
                                                    } else {
                                                        // console.log("not enter");
                                                        // sucess =  addtolineup(teamArray, PF_Players, team, k, LockedTeams, position);
                                                        // i = length;
                                                        i++;
                                                        continue;

                                                    }
                                                } else {
                                                    // console.log("enter2");
                                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                    i = length;
                                                    continue;
                                                }
                                            }
                                            else {
                                                // console.log("no",i);
                                                i++;
                                            }
                                        }

                                        //    // console.log("sucess1",sucess);

                                        if (sucess == 0) {
                                            // console.log("PF_sucessPlayers");
                                            // console.log("PG_Players",PG_Players);
                                            if (lastPlayerSal > 6500) {
                                                sucess = lastPlayer(teamArray, SS_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            } else if (lastPlayerSal < 3500) {
                                                sucess = takelowplayer(teamArray, SS_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            } else {
                                                sucess = addtolineup(teamArray, SS_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            }

                                            // sucess = addtolineup(teamArray, SS_Players, team, k, LockedTeams, lastPlayerSal, position);
                                        }

                                        if (sucess == null) {
                                            // console.log("sucess second in SG",sucess);
                                            sucess = randomplayer(teamArray, SS_Players, team, k, LockedTeams, lastPlayerSal, position);
                                        }

                                        // console.log("sucess",sucess);

                                    }

                                    if (position === "OF") {
                                        OF_Players = OF_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                            .includes(JSON.stringify(elm)));

                                        // G_Players = G_Players.filter(val => !excludePlayers.includes(val));

                                        OF_Players = OF_Players.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection);
                                        });
                                        let teamSalary = team.reduce((acc, item) => {
                                            // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                            return acc + item.DraftKingsSalary;
                                        }, 0);
                                        let lastPlayerSal = (Math.abs(50000 - teamSalary) / 8);

                                        // console.log("last team sal in OF: ", lastPlayerSal);
                                        // console.log("G_Players",G_Players);

                                        let length = lockedPlayers.length;
                                        let sucess = 0;
                                        for (let i = 0; i < length;) {
                                            if (OF_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                                // console.log("yes", exposurePlayer[lockedPlayers[i].PlayerID]);
                                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                                if (j != 0) {
                                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                                    if (!playerCount) {
                                                        newcount = 0;
                                                    } else {
                                                        newcount = playerCount.count;
                                                    }
                                                    // console.log("Count",playerCount);
                                                    // console.log("onlyCount", newcount);
                                                    if (newcount < playerexpo) {
                                                        // console.log("enter");
                                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                        i = length;
                                                        continue;
                                                    } else {
                                                        // console.log("not enter");
                                                        i++;
                                                        continue;
                                                    }

                                                } else {
                                                    // console.log("enter2");
                                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                    i = length;
                                                    continue;
                                                }
                                            }
                                            else {
                                                // console.log("no");
                                                i++;
                                                // continue;
                                            }
                                        }

                                        // console.log("sucess1",sucess);

                                        if (sucess == 0) {
                                            // console.log("G_sucessPlayers");
                                            // console.log("PG_Players",PG_Players);
                                            // sucess =  addtolineup(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);

                                            if (lastPlayerSal > 5000) {
                                                sucess = lastPlayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            } else if (lastPlayerSal < 3500) {
                                                sucess = takelowplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            } else {
                                                sucess = addtolineup(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            }


                                        }

                                        if (sucess == null) {
                                            // console.log("sucess second in SG",sucess);
                                            sucess = randomplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                        }

                                        // console.log("sucess",sucess);

                                    }

                                    if (position === "OF2") {
                                        OF_Players = OF_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                            .includes(JSON.stringify(elm)));

                                        // F_Players = F_Players.filter(val => !excludePlayers.includes(val));

                                        OF_Players = OF_Players.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection);
                                        });
                                        let teamSalary = team.reduce((acc, item) => {
                                            // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                            return acc + item.DraftKingsSalary;
                                        }, 0);
                                        let lastPlayerSal = (Math.abs(50000 - teamSalary) / 2);

                                        // console.log("last team sal in  oF2: ", lastPlayerSal);

                                        let length = lockedPlayers.length;
                                        let sucess = 0;
                                        for (let i = 0; i < length;) {
                                            if (OF_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                                // console.log("yes", exposurePlayer[lockedPlayers[i].PlayerID]);
                                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                                if (j != 0) {
                                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                                    if (!playerCount) {
                                                        newcount = 0;
                                                    } else {
                                                        newcount = playerCount.count;
                                                    }
                                                    // console.log("Count",playerCount);
                                                    // console.log("onlyCount", newcount);
                                                    if (newcount < playerexpo) {
                                                        // console.log("enter");
                                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                        i = length;
                                                        continue;
                                                    } else {
                                                        // console.log("not enter");

                                                        i++;
                                                        continue;

                                                    }

                                                } else {
                                                    // console.log("enter2");
                                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                    i = length;
                                                    continue;
                                                }
                                            }
                                            else {
                                                // console.log("no");
                                                i++;
                                            }
                                        }

                                        // console.log("sucess1",sucess);

                                        if (sucess == 0) {
                                            // console.log("F_sucessPlayers");
                                            // console.log("PG_Players",PG_Players);
                                            if (lastPlayerSal > 6500) {
                                                sucess = lastPlayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            } else if (lastPlayerSal < 3500) {
                                                sucess = takelowplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            } else {
                                                sucess = addtolineup(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            }


                                        }

                                        if (sucess == null) {
                                            // console.log("sucess second in SG",sucess);
                                            sucess = randomplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                        }

                                        // console.log("sucess",sucess);
                                        // addtolineup(teamArray, F_Players, team, k,lastPlayerSal, position);
                                        // console.log("in c");
                                    }

                                    if (position === "OF3") {
                                        OF_Players = OF_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                            .includes(JSON.stringify(elm)));

                                        // UTIL_Players = UTIL_Players.filter(val => !excludePlayers.includes(val));

                                        // console.log("in OF3");
                                        OF_Players = OF_Players.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection);
                                        });
                                        let teamSalary = team.reduce((acc, item) => {
                                            // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                            return acc + item.DraftKingsSalary;
                                        }, 0);
                                        let lastPlayerSal = Math.abs(50000 - teamSalary);
                                        // console.log("last player sal in OF3 : ", lastPlayerSal);
                                        // console.log("last team sal in of3: ", teamSalary);

                                        let length = lockedPlayers.length;
                                        let sucess = 0;
                                        for (let i = 0; i < length;) {
                                            if (OF_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                                // console.log("yes", exposurePlayer[lockedPlayers[i].PlayerID]);
                                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                                if (j != 0) {
                                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                                    if (!playerCount) {
                                                        newcount = 0;
                                                    } else {
                                                        newcount = playerCount.count;
                                                    }
                                                    // console.log("Count",playerCount);
                                                    // console.log("onlyCount", newcount);
                                                    if (newcount < playerexpo) {
                                                        // console.log("enter");
                                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                        i = length;
                                                        continue;
                                                    } else {


                                                        i++;
                                                        continue;

                                                    }

                                                } else {
                                                    // console.log("enter2");
                                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                    i = length;
                                                    continue;
                                                }

                                            }
                                            else {
                                                // console.log("no");
                                                i++;
                                            }
                                        }

                                        // console.log("sucess1",sucess);

                                        if (sucess == 0) {
                                            // console.log("UTIL_sucessPlayers");

                                            sucess = lastPlayerutil(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);

                                            // if (lastPlayerSal > 3500) {
                                            //     sucess = lastPlayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            // }
                                            // else {
                                            //     sucess = lastPlayerutil(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            // }
                                        }

                                        if (sucess == null) {
                                            // console.log("sucess second in SG",sucess);
                                            sucess = randomplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                        }

                                        // console.log("sucess",sucess);


                                    }
                                }

                                function includelockPLayer(teamArr, playerArr, team, k, position) {


                                    if (teamArr.filter(el => el.TeamID == playerArr.TeamID).length == 0) {
                                        // console.log("Before update: 3");
                                        teamArr.push({ PlayerId: playerArr.PlayerID });
                                        teamArr.push({ TeamID: playerArr.TeamID, teamCount });
                                    }
                                    else {
                                        // console.log("Before update: 4");
                                        let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr.TeamID));
                                        if (teamArr[objIndex].teamCount < 4) {
                                            // console.log("Before update: 5");
                                            teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                            teamArr.push({ PlayerId: playerArr.PlayerID });
                                        }
                                        else {
                                            // console.log("Before update: 6");
                                            return 0;
                                        }
                                    }

                                    if (complete.filter(el => el.id == playerArr.PlayerID).length == 0) {
                                        // console.log("Before update: 1");
                                        count = 1;
                                        let playerDataWithCount = {
                                            id: playerArr.PlayerID,
                                            TeamID: playerArr.TeamID,
                                            count: count
                                        }
                                        complete.push(playerDataWithCount);
                                    }
                                    else {

                                        // console.log("Before update: 2");
                                        let objIndex = complete.findIndex((obj => obj.id == playerArr.PlayerID));
                                        // console.log("Before update: ", complete[objIndex]);
                                        complete[objIndex].count = complete[objIndex].count + 1;
                                    }

                                    team[k] = playerArr;
                                    return 1;
                                }

                                function firstPLayerpitcher(teamArr, AllplayerArr, team, k, LockedTeams, position) {

                                    // console.log("first: "); 
                                    let playerArr = [];


                                    if (LockedTeams) {
                                        // array exists and is not empty
                                        // console.log("lockedTeams: Last ", LockedTeams['9']);

                                        for (const [key, value] of Object.entries(LockedTeams)) {
                                            // console.log(key , value);
                                            let array1 = AllplayerArr.filter(obj => {

                                                // console.log("array :1 ", obj.TeamID); 
                                                return obj.TeamID == key
                                            });
                                            array1 = Object.assign(array1);
                                            playerArr = playerArr.concat(array1);
                                            // playerArr.push(array1);
                                        }
                                    }

                                    playerArr = AllplayerArr.filter(elm => !playerArr.map(elm => JSON.stringify(elm))
                                        .includes(JSON.stringify(elm)));

                                    let playerlength = 0;

                                    if (playerArr.length > 10) {
                                        playerlength = 9;
                                    } else {
                                        playerlength = playerArr.length - 1;
                                    }

                                    // console.log("first arrayfinal ", playerArr.length);

                                    let length = playerArr.length + 30;

                                    for (let i = 0; i < length;) {
                                        let n = Math.floor(Math.random() * Math.floor(playerlength));
                                        // console.log("teamId: ", playerArr[n].TeamID);
                                        let needvalue = 1.5;

                                        if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                                            && playerArr[n].DraftKingsProjection >= 3 && playerArr[n].DraftKingsVal >= needvalue) {

                                            if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                            }
                                            else {
                                                let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                                if (teamArr[objIndex].teamCount < 4) {
                                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                }
                                                else {
                                                    i++;
                                                    continue;
                                                }
                                            }

                                            if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                                count = 1;
                                                let playerDataWithCount = {
                                                    id: playerArr[n].PlayerID,
                                                    TeamID: playerArr[n].TeamID,
                                                    count: count
                                                }
                                                complete.push(playerDataWithCount);
                                            }
                                            else {
                                                let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                                // console.log("Before update: ", complete[objIndex]);
                                                complete[objIndex].count = complete[objIndex].count + 1;
                                            }

                                            salary = salary - playerArr[n].DraftKingsSalary;
                                            team[k] = playerArr[n];
                                            i = length;
                                            // console.log("in compare team: ", team);
                                            return 1;
                                        }
                                        else {
                                            i++;
                                        }
                                    }

                                }

                                function addtolineuppitcher(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position) {

                                    // console.log("Add to line up: ");
                                    let addlastPlayerSal = 7000;
                                    let playerlength = 0;
                                    let playerArr = [];

                                    if (LockedTeams) {
                                        // array exists and is not empty
                                        // console.log("lockedTeams: Last ", LockedTeams['9']);

                                        for (const [key, value] of Object.entries(LockedTeams)) {
                                            // console.log(key , value);
                                            let array1 = AllplayerArr.filter(obj => {

                                                // console.log("array :1 ", obj.TeamID); 
                                                return obj.TeamID == key
                                            });
                                            array1 = Object.assign(array1);
                                            playerArr = playerArr.concat(array1);
                                            // playerArr.push(array1);
                                        }
                                    }

                                    playerArr = AllplayerArr.filter(elm => !playerArr.map(elm => JSON.stringify(elm))
                                        .includes(JSON.stringify(elm)));

                                    // console.log("playerlength ",playerArr.length);

                                    if (playerArr.length > 20) {
                                        playerlength = 19;
                                    } else {
                                        playerlength = playerArr.length - 1;
                                    }

                                    // console.log("playerlength ",playerlength);

                                    let length = playerArr.length + 30;

                                    for (let i = 0; i < length;) {
                                        let n = Math.floor(Math.random() * Math.floor(playerlength));
                                        let needvalue = 1.5;

                                        // console.log("teamId: ", playerArr[n].TeamID);
                                        // console.log("position: ", n);
                                        // console.log("playerArr[n].DraftKingsProjection: ", playerArr[n].DraftKingsProjection,n);
                                        if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                                            && playerArr[n].DraftKingsProjection >= 3 && playerArr[n].DraftKingsVal >= needvalue) {
                                            // console.log("position: enter3 ");
                                            if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                                // console.log("position: 3 ");
                                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                            }
                                            else {
                                                let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                                if (teamArr[objIndex].teamCount < 4) {
                                                    // console.log("position: 4 ");
                                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                }
                                                else {
                                                    // console.log("position: 5 ");
                                                    i++;
                                                    continue;
                                                }
                                            }

                                            if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                                // console.log("position: 1 ");
                                                count = 1;
                                                let playerDataWithCount = {
                                                    id: playerArr[n].PlayerID,
                                                    TeamID: playerArr[n].TeamID,
                                                    count: count
                                                }
                                                complete.push(playerDataWithCount);
                                            }
                                            else {
                                                // console.log("position: 2 ");
                                                let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                                // console.log("Before update: ", complete[objIndex]);
                                                complete[objIndex].count = complete[objIndex].count + 1;
                                            }


                                            // salary = salary - playerArr[n].DraftKingsSalary;
                                            team[k] = playerArr[n];
                                            i = length;
                                            // console.log("in compare team: ", team);
                                            return 1;
                                        }
                                        else {
                                            i++;
                                        }
                                    }

                                }

                                function takelowplayer(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position) {

                                    // console.log("low player ");

                                    let playerArr = [];
                                    let addlastPlayerSal = 0;
                                    let playerlength = 0;
                                    let teamfilter = 0;

                                    // if (LockedTeams) {
                                    //     // array exists and is not empty
                                    //     // console.log("lockedTeams: Last ", LockedTeams['9']);

                                    //     for (const [key, value] of Object.entries(LockedTeams)) {
                                    //         // console.log(key , value);
                                    //         // console.log("teamArr.length: ", teamArr.length); 
                                    //         // console.log("teamArr.filter(el => el.TeamID == key).length: ", teamArr.filter(el => el.TeamID == key).length); 
                                    //         if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                                    //             // console.log("yes:1",);
                                    //             let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                                    //             // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                                    //             if (value > teamArr[objIndex].teamCount) {
                                    //                 // console.log("Teenter",key); 
                                    //                 // filter lock teams
                                    //                 let array1 = AllplayerArr.filter(obj => {

                                    //                     // console.log("array :1 ", obj.TeamID); 
                                    //                     return obj.TeamID == key
                                    //                 });

                                    //                 array1 = Object.assign(array1);
                                    //                 playerArr = playerArr.concat(array1);
                                    //                 // playerArr.push(array1);
                                    //             }
                                    //         } else {
                                    //             // console.log("yes:2",);
                                    //             // console.log("Teamid",key); 
                                    //             let array1 = AllplayerArr.filter(obj => {

                                    //                 // console.log("array :1 ", obj.TeamID); 
                                    //                 return obj.TeamID == key
                                    //             });
                                    //             array1 = Object.assign(array1);
                                    //             playerArr = playerArr.concat(array1);
                                    //             // playerArr.push(array1);

                                    //         }

                                    //     }
                                    // }

                                    // console.log("add arrayfinal before", playerArr.length);
                                    // playerArr = playerArr.filter(item => item.DraftKingsProjection != 0);
                                    // playerArr = playerArr.filter(item => item.DraftKingsSalary <= 5000);

                                    if (playerArr.length == 0) {
                                        playerArr = AllplayerArr;
                                        addlastPlayerSal = 3500;
                                        playerArr = playerArr.filter(item => item.DraftKingsSalary <= addlastPlayerSal);
                                        playerArr = playerArr.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection)
                                        })
                                        if (playerArr.length > 15) {
                                            playerlength = 14;
                                        } else {
                                            playerlength = playerArr.length - 1;
                                        }
                                        teamfilter = 1;

                                    } else {
                                        addlastPlayerSal = 3500;
                                        playerArr = playerArr.filter(item => item.DraftKingsSalary <= addlastPlayerSal);
                                        playerArr = playerArr.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection)
                                        })

                                        playerlength = playerArr.length - 1;
                                    }

                                    // console.log("add arrayfinal ", playerArr.length);

                                    // playerArr = playerArr.filter(item => item.DraftKingsSalary <= 4500);


                                    let length = playerArr.length + 40;
                                    // console.log("length ", length);
                                    if (teamfilter === 1) {
                                        for (let i = 0; i < length;) {
                                            let n = Math.floor(Math.random() * Math.floor(playerlength));
                                            let needvalue = 1;

                                            // console.log("teamId: ", playerArr[n].TeamID);
                                            // console.log("position: ", n);
                                            // console.log("playerArr[n]: ", playerArr[n].DraftKingsProjection,i,n,playerArr[n].DraftKingsVal,playerArr[n].DraftKingsSalary);
                                            if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                                                && addlastPlayerSal >= playerArr[n].DraftKingsSalary
                                                && playerArr[n].DraftKingsProjection >= 5 && playerArr[n].DraftKingsVal >= needvalue) {
                                                // console.log("position: enter3 ");
                                                if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                                    // console.log("position: 3 ");
                                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                    teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                                }
                                                else {
                                                    let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                                    if (teamArr[objIndex].teamCount < 4) {
                                                        // console.log("position: 4 ");
                                                        teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                                        teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                    }
                                                    else {
                                                        // console.log("position: 5 ");
                                                        i++;
                                                        continue;
                                                    }
                                                }

                                                if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                                    // console.log("position: 1 ");
                                                    count = 1;
                                                    let playerDataWithCount = {
                                                        id: playerArr[n].PlayerID,
                                                        TeamID: playerArr[n].TeamID,
                                                        count: count
                                                    }
                                                    complete.push(playerDataWithCount);
                                                }
                                                else {
                                                    // console.log("position: 2 ");
                                                    let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                                    // console.log("Before update: ", complete[objIndex]);
                                                    complete[objIndex].count = complete[objIndex].count + 1;
                                                }


                                                // salary = salary - playerArr[n].DraftKingsSalary;
                                                team[k] = playerArr[n];
                                                i = length;
                                                // console.log("in compare team: ", team);
                                                return 1;
                                            }
                                            else {
                                                i++;
                                            }
                                        }
                                    } else {

                                        playerArr = playerArr.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection);
                                        });

                                        // length = length + 30;
                                        for (let i = 0; i < playerArr.length;) {
                                            let n = i;
                                            let needvalue = 1;

                                            // console.log("teamId: ", playerArr[n].TeamID);
                                            // console.log("position: ", n);
                                            // console.log("DraftKingsProjection: ", playerArr[n].DraftKingsProjection,i,n,playerArr[n].DraftKingsVal);
                                            if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                                                && playerArr[n].DraftKingsProjection >= 5 && playerArr[n].DraftKingsVal >= needvalue) {
                                                // console.log("position: enter3 ");
                                                if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                                    // console.log("position: 3 ");
                                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                    teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                                }
                                                else {
                                                    let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                                    if (teamArr[objIndex].teamCount < 4) {
                                                        // console.log("position: 4 ");
                                                        teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                                        teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                    }
                                                    else {
                                                        // console.log("position: 5 ");
                                                        i++;
                                                        continue;
                                                    }
                                                }

                                                if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                                    // console.log("position: 1 ");
                                                    count = 1;
                                                    let playerDataWithCount = {
                                                        id: playerArr[n].PlayerID,
                                                        TeamID: playerArr[n].TeamID,
                                                        count: count
                                                    }
                                                    complete.push(playerDataWithCount);
                                                }
                                                else {
                                                    // console.log("position: 2 ");
                                                    let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                                    // console.log("Before update: ", complete[objIndex]);
                                                    complete[objIndex].count = complete[objIndex].count + 1;
                                                }


                                                // salary = salary - playerArr[n].DraftKingsSalary;
                                                team[k] = playerArr[n];
                                                i = length;
                                                // console.log("in compare team: ", team);
                                                return 1;
                                            }
                                            else {
                                                i++;
                                            }
                                        }
                                    }
                                }

                                function firstPLayer(teamArr, AllplayerArr, team, k, LockedTeams, position) {

                                    // console.log("first: "); 
                                    let playerArr = [];
                                    let playerlength = 0;
                                    let teamfilter = 0;

                                    if (LockedTeams) {
                                        // array exists and is not empty
                                        // console.log("lockedTeams: Last ", LockedTeams['9']);

                                        for (const [key, value] of Object.entries(LockedTeams)) {
                                            // console.log(key , value);
                                            if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                                                // console.log("yes:",);
                                                let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                                                // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                                                if (value > teamArr[objIndex].teamCount) {
                                                    // console.log("Teamid",key); 
                                                    // filter lock teams
                                                    let array1 = AllplayerArr.filter(obj => {

                                                        // console.log("array :1 ", obj.TeamID); 
                                                        return obj.TeamID == key
                                                    });
                                                    array1 = Object.assign(array1);
                                                    playerArr = playerArr.concat(array1);
                                                    // playerArr.push(array1);
                                                }
                                            } else {
                                                // console.log("Teamid",key); 
                                                let array1 = AllplayerArr.filter(obj => {

                                                    // console.log("array :1 ", obj.TeamID); 
                                                    return obj.TeamID == key
                                                });
                                                array1 = Object.assign(array1);
                                                playerArr = playerArr.concat(array1);
                                                // playerArr.push(array1);

                                            }

                                        }
                                    }


                                    // console.log("arrayfinal first ", playerArr.length);
                                    playerArr = playerArr.filter(item => item.DraftKingsProjection != 0);

                                    if (playerArr.length == 0) {
                                        playerArr = AllplayerArr;
                                        playerlength = 5;
                                        teamfilter = 1;
                                    } else {
                                        // playerArr = playerArr.filter(item => item.DraftKingsProjection != 0);
                                        playerlength = playerArr.length;
                                    }

                                    // console.log("first arrayfinal ", playerArr.length);

                                    let length = playerArr.length + 30;

                                    if (teamfilter === 1) {

                                        for (let i = 0; i < length;) {
                                            let n = Math.floor(Math.random() * Math.floor(playerlength));
                                            // console.log("teamId: ", playerArr[n].TeamID);
                                            let needvalue = 1.5;

                                            if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                                                && playerArr[n].DraftKingsProjection >= 3 && playerArr[n].DraftKingsVal >= needvalue) {

                                                if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                    teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                                }
                                                else {
                                                    let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                                    if (teamArr[objIndex].teamCount < 4) {
                                                        teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                                        teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                    }
                                                    else {
                                                        i++;
                                                        continue;
                                                    }
                                                }

                                                if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                                    count = 1;
                                                    let playerDataWithCount = {
                                                        id: playerArr[n].PlayerID,
                                                        TeamID: playerArr[n].TeamID,
                                                        count: count
                                                    }
                                                    complete.push(playerDataWithCount);
                                                }
                                                else {
                                                    let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                                    // console.log("Before update: ", complete[objIndex]);
                                                    complete[objIndex].count = complete[objIndex].count + 1;
                                                }

                                                salary = salary - playerArr[n].DraftKingsSalary;
                                                team[k] = playerArr[n];
                                                i = length;
                                                // console.log("in compare team: ", team);
                                                return 1;
                                            }
                                            else {
                                                i++;
                                            }
                                        }
                                    } else {


                                        for (let i = 0; i < length;) {
                                            let n = Math.floor(Math.random() * Math.floor(playerlength));
                                            // console.log("teamId: ", playerArr[n].TeamID,playerArr[n].DraftKingsProjection,playerArr[n].DraftKingsVal);
                                            let needvalue = 1;

                                            if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                                                && playerArr[n].DraftKingsProjection >= 3 && playerArr[n].DraftKingsVal >= needvalue) {

                                                if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                    teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                                }
                                                else {
                                                    let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                                    if (teamArr[objIndex].teamCount < 4) {
                                                        teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                                        teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                    }
                                                    else {
                                                        i++;
                                                        continue;
                                                    }
                                                }

                                                if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                                    count = 1;
                                                    let playerDataWithCount = {
                                                        id: playerArr[n].PlayerID,
                                                        TeamID: playerArr[n].TeamID,
                                                        count: count
                                                    }
                                                    complete.push(playerDataWithCount);
                                                }
                                                else {
                                                    let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                                    // console.log("Before update: ", complete[objIndex]);
                                                    complete[objIndex].count = complete[objIndex].count + 1;
                                                }

                                                salary = salary - playerArr[n].DraftKingsSalary;
                                                team[k] = playerArr[n];
                                                i = length;
                                                // console.log("in compare team: ", team);
                                                return 1;
                                            }
                                            else {
                                                i++;
                                            }
                                        }
                                    }
                                }

                                function addtolineup(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position) {

                                    // console.log("Add to line up: ");

                                    let playerArr = [];
                                    let addlastPlayerSal = 0;
                                    let playerlength = 0;
                                    let teamfilter = 0;

                                    // if (LockedTeams) {
                                    //     // array exists and is not empty
                                    //     // console.log("lockedTeams: Last ", LockedTeams['9']);

                                    //     for (const [key, value] of Object.entries(LockedTeams)) {
                                    //         // console.log(key , value);
                                    //         // console.log("teamArr.length: ", teamArr.length); 
                                    //         // console.log("teamArr.filter(el => el.TeamID == key).length: ", teamArr.filter(el => el.TeamID == key).length); 
                                    //         if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                                    //             // console.log("yes:1",);
                                    //             let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                                    //             // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                                    //             if (value > teamArr[objIndex].teamCount) {
                                    //                 // console.log("Teenter",key); 
                                    //                 // filter lock teams
                                    //                 let array1 = AllplayerArr.filter(obj => {

                                    //                     // console.log("array :1 ", obj.TeamID); 
                                    //                     return obj.TeamID == key
                                    //                 });

                                    //                 array1 = Object.assign(array1);
                                    //                 playerArr = playerArr.concat(array1);
                                    //                 // playerArr.push(array1);
                                    //             }
                                    //         } else {
                                    //             // console.log("yes:2",);
                                    //             // console.log("Teamid",key); 
                                    //             let array1 = AllplayerArr.filter(obj => {

                                    //                 // console.log("array :1 ", obj.TeamID); 
                                    //                 return obj.TeamID == key
                                    //             });
                                    //             array1 = Object.assign(array1);
                                    //             playerArr = playerArr.concat(array1);
                                    //             // playerArr.push(array1);

                                    //         }

                                    //     }
                                    // }

                                    // console.log("add arrayfinal before", playerArr.length);
                                    // playerArr = playerArr.filter(item => item.DraftKingsProjection != 0);

                                    if (playerArr.length == 0) {
                                        playerArr = AllplayerArr;
                                        playerArr = playerArr.filter(item => item.DraftKingsProjection != 0);
                                        playerArr = playerArr.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection)
                                        })
                                        addlastPlayerSal = 9000;
                                        if (playerArr.length > 10) {
                                            playerlength = 9;
                                        } else {
                                            playerlength = playerArr.length;
                                        }
                                        teamfilter = 1;

                                    } else {

                                        playerArr = playerArr.filter(item => item.DraftKingsProjection != 0);
                                        playerArr = playerArr.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection)
                                        })

                                        addlastPlayerSal = 9000;

                                        playerlength = playerArr.length - 1;
                                    }

                                    // console.log("add arrayfinal ", playerArr.length);



                                    let length = playerArr.length + 30;
                                    // console.log("length ", length);
                                    if (teamfilter === 1) {
                                        for (let i = 0; i < length;) {
                                            let n = Math.floor(Math.random() * Math.floor(playerlength));
                                            let needvalue = 1.5;

                                            // console.log("teamId: ", playerArr[n].TeamID);
                                            // console.log("position: ", n);
                                            // console.log("playerArr[n]: ", playerArr[n].DraftKingsProjection,i,n,playerArr[n].DraftKingsVal);
                                            if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                                                && addlastPlayerSal >= playerArr[n].DraftKingsSalary
                                                && playerArr[n].DraftKingsProjection >= 3 && playerArr[n].DraftKingsVal >= needvalue) {
                                                // console.log("position: enter3 ");
                                                if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                                    // console.log("position: 3 ");
                                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                    teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                                }
                                                else {
                                                    let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                                    if (teamArr[objIndex].teamCount < 4) {
                                                        // console.log("position: 4 ");
                                                        teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                                        teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                    }
                                                    else {
                                                        // console.log("position: 5 ");
                                                        i++;
                                                        continue;
                                                    }
                                                }

                                                if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                                    // console.log("position: 1 ");
                                                    count = 1;
                                                    let playerDataWithCount = {
                                                        id: playerArr[n].PlayerID,
                                                        TeamID: playerArr[n].TeamID,
                                                        count: count
                                                    }
                                                    complete.push(playerDataWithCount);
                                                }
                                                else {
                                                    // console.log("position: 2 ");
                                                    let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                                    // console.log("Before update: ", complete[objIndex]);
                                                    complete[objIndex].count = complete[objIndex].count + 1;
                                                }


                                                // salary = salary - playerArr[n].DraftKingsSalary;
                                                team[k] = playerArr[n];
                                                i = length;
                                                // console.log("in compare team: ", team);
                                                return 1;
                                            }
                                            else {
                                                i++;
                                            }
                                        }
                                    } else {
                                        // length = length + 30;
                                        playerArr = playerArr.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection)
                                        })

                                        for (let i = 0; i < playerArr.length;) {
                                            // let n = Math.floor(Math.random() * Math.floor(playerlength));
                                            let n = i;
                                            let needvalue = 1;

                                            // console.log("teamId: ", playerArr[n].TeamID);
                                            // console.log("position: ", n);
                                            // console.log("DraftKingsProjection: ", playerArr[n].DraftKingsProjection,i,n,playerArr[n].DraftKingsVal);
                                            if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0

                                                && playerArr[n].DraftKingsProjection >= 3 && playerArr[n].DraftKingsVal >= needvalue) {
                                                // console.log("position: enter3 ");
                                                if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                                    // console.log("position: 3 ");
                                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                    teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                                }
                                                else {
                                                    let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                                    if (teamArr[objIndex].teamCount < 4) {
                                                        // console.log("position: 4 ");
                                                        teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                                        teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                    }
                                                    else {
                                                        // console.log("position: 5 ");
                                                        i++;
                                                        continue;
                                                    }
                                                }

                                                if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                                    // console.log("position: 1 ");
                                                    count = 1;
                                                    let playerDataWithCount = {
                                                        id: playerArr[n].PlayerID,
                                                        TeamID: playerArr[n].TeamID,
                                                        count: count
                                                    }
                                                    complete.push(playerDataWithCount);
                                                }
                                                else {
                                                    // console.log("position: 2 ");
                                                    let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                                    // console.log("Before update: ", complete[objIndex]);
                                                    complete[objIndex].count = complete[objIndex].count + 1;
                                                }


                                                // salary = salary - playerArr[n].DraftKingsSalary;
                                                team[k] = playerArr[n];
                                                i = length;
                                                // console.log("in compare team: ", team);
                                                return 1;
                                            }
                                            else {
                                                i++;
                                            }
                                        }
                                    }
                                }

                                function randomplayer(teamArr, playerArr, team, k, LockedTeams, lastPlayerSal, position) {

                                    // console.log("Random: ");
                                    let addlastPlayerSal = lastPlayerSal;

                                    resultA = playerArr.sort((a, b) => {
                                        return (b.DraftKingsProjection - a.DraftKingsProjection)
                                    })

                                    let length = playerArr.length;
                                    for (let i = 0; i < length;) {
                                        let n = i;
                                        let needvalue = 1;
                                        // let n = Math.floor(Math.random() * Math.floor(length));
                                        // console.log("teamId: ", playerArr[n].TeamID);
                                        // console.log("position: ", n);
                                        // console.log("salary: ", playerArr[i].DraftKingsSalary);
                                        if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                                            && addlastPlayerSal <= playerArr[n].DraftKingsSalary
                                            && playerArr[n].DraftKingsProjection >= 3 && playerArr[n].DraftKingsVal >= needvalue) {
                                            // console.log("position: enter3 ");
                                            if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                                // console.log("position: 3 ");
                                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                            }
                                            else {
                                                let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                                if (teamArr[objIndex].teamCount < 4) {
                                                    // console.log("position: 4 ");
                                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                }
                                                else {
                                                    // console.log("position: 5 ");
                                                    i++;
                                                    continue;
                                                }
                                            }

                                            if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                                // console.log("position: 1 ");
                                                count = 1;
                                                let playerDataWithCount = {
                                                    id: playerArr[n].PlayerID,
                                                    TeamID: playerArr[n].TeamID,
                                                    count: count
                                                }
                                                complete.push(playerDataWithCount);
                                            }
                                            else {
                                                // console.log("position: 2 ");
                                                let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                                // console.log("Before update: ", complete[objIndex]);
                                                complete[objIndex].count = complete[objIndex].count + 1;
                                            }


                                            // salary = salary - playerArr[n].DraftKingsSalary;
                                            team[k] = playerArr[n];
                                            i = length;
                                            // console.log("in compare team: ", team);
                                            return 1;
                                        }
                                        else {
                                            i++;
                                        }
                                    }
                                }

                                function lastPlayer(teamArr, playerArr, team, k, LockedTeams, lastPlayerSal, position) {

                                    // console.log("last player: ");

                                    resultA = playerArr.sort((a, b) => {
                                        return (b.DraftKingsSalary - a.DraftKingsSalary) || (b.DraftKingsProjection - a.DraftKingsProjection)
                                    })
                                    // console.log("resultA: ",resultA);
                                    let length = resultA.length + 30;
                                    let playerlength = resultA.length - 1;
                                    // console.log("resultA: ",teamCount);
                                    for (let i = 0; i <= length;) {

                                        let l = Math.floor(Math.random() * Math.floor(playerlength));
                                        let needvalue = 1;

                                        // console.log("result Sallary l: ",resultA[l].DraftKingsSalary);

                                        if (teamArr.filter(item => item.PlayerId == resultA[l].PlayerID).length == 0
                                            && lastPlayerSal >= resultA[l].DraftKingsSalary
                                            && resultA[l].DraftKingsProjection >= 3 && resultA[l].DraftKingsVal >= needvalue) {

                                            if (teamArr.filter(el => el.TeamID == resultA[l].TeamID).length == 0) {
                                                // console.log("resultA: 3");
                                                teamArr.push({ PlayerId: resultA[l].PlayerID });
                                                teamArr.push({ TeamID: resultA[l].TeamID, teamCount });
                                            }
                                            else {
                                                let objIndex = teamArr.findIndex((obj => obj.TeamID == resultA[l].TeamID));
                                                if (teamArr[objIndex].teamCount < 4) {
                                                    // console.log("resultA: 4");
                                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                                    teamArr.push({ PlayerId: resultA[l].PlayerID });
                                                }
                                                else {
                                                    // console.log("resultA: 5");
                                                    i++;
                                                    continue;
                                                }
                                            }

                                            if (complete.filter(el => el.id == resultA[l].PlayerID).length == 0) {
                                                // console.log("resultA: 1");
                                                count = 1;
                                                let playerDataWithCount = {
                                                    id: resultA[l].PlayerID,
                                                    TeamID: resultA[l].TeamID,
                                                    count: count
                                                }
                                                complete.push(playerDataWithCount);
                                            }
                                            else {
                                                // console.log("resultA: 2");
                                                let objIndex = complete.findIndex((obj => obj.id == resultA[l].PlayerID));
                                                // console.log("Before update: ", complete[objIndex]);
                                                complete[objIndex].count = complete[objIndex].count + 1;
                                            }


                                            // salary = salary - playerArr[l].DraftKingsSalary;
                                            // console.log("teamArr: ",teamArr);
                                            team[k] = resultA[l];
                                            // console.log("in compare team: ", team);
                                            i = length;

                                            return 1;

                                        }
                                        else {
                                            i++;
                                            continue;
                                        }
                                    }
                                }

                                function lastPlayerutil(teamArr, playerArr, team, k, LockedTeams, lastPlayerSal, position) {


                                    // let resultA = playerArr.filter(elm => !teamArr.map(elm => JSON.stringify(elm))
                                    //     .includes(JSON.stringify(elm)));

                                    // let resultPLayerA= playerArr.filter(function(cv){
                                    //     return !teamArr.find(function(e){
                                    //         return e.PlayerId == cv.PlayerID;
                                    //     });
                                    // });

                                    playerArr = playerArr.filter(item => item.DraftKingsSalary <= lastPlayerSal);

                                    resultA = playerArr.sort((a, b) => {
                                        return (b.DraftKingsSalary - a.DraftKingsSalary) || (b.DraftKingsProjection - a.DraftKingsProjection)
                                    })

                                    // console.log("resultA: ",resultA);
                                    let length = resultA.length - 1;
                                    // console.log("resultA: ",teamCount);
                                    for (let i = 0; i <= length;) {
                                        let playerlength = 20;
                                        let l = i;
                                        let needvalue = 1;
                                        // console.log("teamId: ", resultA[l].TeamID);
                                        // console.log("result inside l: ",l,resultA[l].DraftKingsSalary,resultA[l].Name,resultA[l].DraftKingsProjection,resultA[l].DraftKingsVal);
                                        // if (resultA[l].DepthChartOrder == '0') {
                                        // console.log("last player result Sallary l: ",resultA[l].DraftKingsSalary,resultA[l].Name,resultA[l].DraftKingsVal);

                                        if (teamArr.filter(item => item.PlayerId == resultA[l].PlayerID).length == 0
                                            && lastPlayerSal >= resultA[l].DraftKingsSalary
                                            && resultA[l].DraftKingsProjection >= 3 && resultA[l].DraftKingsVal >= needvalue) {

                                            if (teamArr.filter(el => el.TeamID == resultA[l].TeamID).length == 0) {
                                                // console.log("resultA: 3");
                                                teamArr.push({ PlayerId: resultA[l].PlayerID });
                                                teamArr.push({ TeamID: resultA[l].TeamID, teamCount });
                                            }
                                            else {
                                                let objIndex = teamArr.findIndex((obj => obj.TeamID == resultA[l].TeamID));
                                                if (teamArr[objIndex].teamCount < 4) {
                                                    // console.log("resultA: 4");
                                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                                    teamArr.push({ PlayerId: resultA[l].PlayerID });
                                                }
                                                else {
                                                    // console.log("resultA: 5");
                                                    i++;
                                                    continue;
                                                }
                                            }

                                            if (complete.filter(el => el.id == resultA[l].PlayerID).length == 0) {
                                                // console.log("resultA: 1");
                                                count = 1;
                                                let playerDataWithCount = {
                                                    id: resultA[l].PlayerID,
                                                    TeamID: resultA[l].TeamID,
                                                    count: count
                                                }
                                                complete.push(playerDataWithCount);
                                            }
                                            else {
                                                // console.log("resultA: 2");
                                                let objIndex = complete.findIndex((obj => obj.id == resultA[l].PlayerID));
                                                // console.log("Before update: ", complete[objIndex]);
                                                complete[objIndex].count = complete[objIndex].count + 1;
                                            }


                                            // salary = salary - playerArr[l].DraftKingsSalary;
                                            // console.log("teamArr: ",teamArr);
                                            team[k] = resultA[l];
                                            // console.log("in compare team: ", team);
                                            i = length;

                                            return 1;

                                        }
                                        else {
                                            i++;
                                            continue;
                                        }
                                        //}else{

                                        //  l++;
                                        // }
                                    }
                                }

                                teamArray = [];

                                let teamSalary = team.reduce((acc, item) => {
                                    // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                    return acc + item.DraftKingsSalary;
                                }, 0);

                                // console.log("team salary", teamSalary);
                                let getbuild = l * 30;
                                if (j == getbuild) {
                                    //    // console.log(getbuild,"team",j,complete_team,teamcreate,reqsalary);
                                    if (complete_team > teamcreate) {
                                        reqsalary = reqsalary;
                                        teamcreate = complete_team;
                                    } else {
                                        reqsalary = reqsalary - 500;
                                        teamcreate = complete_team;
                                    }
                                    l = l + 1;
                                }

                                if (teamSalary <= 50000 && teamSalary >= reqsalary) {
                                    // console.log("aeraea team salary", teamSalary);
                                    allTeams.push(team);

                                    let stringArray = allTeams.map(JSON.stringify);
                                    let uniqueStringArray = new Set(stringArray);
                                    allTeams = Array.from(uniqueStringArray, JSON.parse);

                                    complete_team = allTeams.length;
                                    // console.log(complete);

                                    for (const [key, value] of Object.entries(exposurePlayer)) {
                                        // console.log(key, value);
                                        let newplayerCount = complete.find(item => item.id === key);
                                        if (newplayerCount)
                                            if (value === newplayerCount.count) {
                                                exposurePlayer[key] = 0;
                                                delete exposurePlayer[key];
                                            }
                                    }

                                } else {

                                    for (const [key, value] of Object.entries(exposurePlayer)) {
                                        // console.log(key, value);
                                        exposurePlayer[key] = value + 1;
                                    }
                                    // console.log("Exposure players array: ", exposurePlayer);
                                }
                                // console.log("complete_team: ", complete_team);
                                // console.log("get_builds: ", get_builds);
                                if (complete_team == get_builds) {
                                    j = no_of_builds + 1;
                                }
                            }

                            var totalteams = allTeams;



                            allTeams = allTeams.slice(-req.NumberOfBuild);


                            let salaryArray = [];
                            let projArray = [];
                            for (let i = 0; i < allTeams.length; i++) {
                                let teamSalary = 0;
                                let teamProjection = 0;
                                for (let j = 0; j < allTeams[i].length; j++) {
                                    // console.log("salary: ", allTeams[i][j].DraftKingsSalary);
                                    teamSalary = teamSalary + allTeams[i][j].DraftKingsSalary;
                                    teamProjection = teamProjection + allTeams[i][j].DraftKingsProjection;
                                }
                                // console.log("teamProjection",teamProjection);
                                salaryArray[i] = teamSalary;
                                var ProjectionArray = {};
                                Object.assign(ProjectionArray, { teamnumber: i, teamvalue: teamProjection });
                                projArray.push(ProjectionArray);
                            }

                            let stringArray = allTeams.map(JSON.stringify);
                            let uniqueStringArray = new Set(stringArray);
                            allTeams = Array.from(uniqueStringArray, JSON.parse);

                            let arrangeTeams = [];
                            // let positions = ["QB","WR1","WR2","RB1","RB2","WR3","TE","FLEX","DST"];

                            for (let i = 0; i < allTeams.length; i++) {
                                let team = [];
                                for (let j = 0; j < allTeams[i].length; j++) {
                                    //    // console.log("i",i,"j: ", j,"newPos",newPos[j]);
                                    team[j] = allTeams[i][newPos[j]];
                                }
                                arrangeTeams.push(team);
                            }

                            // console.log("arrangeTeams",arrangeTeams);
                            allTeams = arrangeTeams;

                            projArray = projArray.sort((a, b) => b.teamvalue - a.teamvalue);

                            let projectarrangeTeams = [];
                            let projectposition = [];
                            for (let i = 0; i < projArray.length; i++) {
                                projectposition.push(projArray[i].teamnumber);
                            }

                            // console.log("projectposition",projectposition);

                            for (let i = 0; i < allTeams.length; i++) {
                                // console.log(projectposition[i]);
                                let newteam = allTeams[projectposition[i]];
                                projectarrangeTeams.push(newteam);
                            }

                            allTeams = projectarrangeTeams;

                            var senddata = {
                                "status": 0,
                                "success": true,
                                "allTeams": allTeams,
                                "salaryArray": salaryArray,
                                "delay": 3000
                            }

                            const slatTeamData = {
                                Teams: totalteams,
                            }
                            await SlatPlayers.update({SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, slatTeamData, (error, doc) => {
                                if (error || !doc) {
                                    console.log("mlb DB error : Slat data update error");
                                }
                                else {
                                    console.log("mlb Teams data update");
                                    socket.emit('mlbcreatebuild-success', senddata);
                                }
                            })

                            // socket.emit('mlbcreatebuild-success', allTeams,WR_Players,QB_Players,RB_Players,TE_Players,FLEX_Players,DST_Players);
                            
                            // console.log("allTeams: ", allTeams);
                            // res.send({ status: 0, allTeams, salaryArray, B1_Players, B3_Players, OF_Players, B2_Players, SS_Players });
                            // res.send({ PG_Players, SG_Players, PF_Players, SF_Players, G_Players, F_Players, UTIL_Players});
                        }

                    })
            })
    }
    catch (error) {
        console.log(error);
        var response = {
            status: 1, success: false, messages: "something went wrong"
        }
        socket.emit('mlbcreatebuild-success', response);
        // res.send({ error, status: 1, success: false, messages: "something went wrong" });
    }
}

module.exports.nextsocket_create_build = async function (io, socket, req) {
    try {

        let istest = await SlatPlayers.findOne({SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, { Players: 1, Teams: 1 });
        console.log("istest", istest.Teams.length)
        var AllTypePlayers = istest.Players[0];
        var AllTypeTeams = istest.Teams;

        let P_Players = AllTypePlayers.P;
        let C_Players = AllTypePlayers.C;
        let SS_Players = AllTypePlayers.SS;
        let OF_Players = AllTypePlayers.OF;
        let B1_Players = AllTypePlayers.B1;
        let B2_Players = AllTypePlayers.B2;
        let B3_Players = AllTypePlayers.B3;
        let All_Players = AllTypePlayers.All;
        let excludePlayers = AllTypePlayers.Exclude;
        let alockedPlayers = AllTypePlayers.Lock;
        let exposurePlayer = {};
        if(AllTypePlayers.Exposure){
            exposurePlayer = AllTypePlayers.Exposure;
        }
        let complete = [];
        let allTeams = [];
        let teamArray = [];
        var currentdate = moment().tz("America/New_York").format('YYYY-MM-DDT00:00:00');

        let no_of_builds = 1500;
        let get_builds = req.NumberOfBuild;
        // let get_builds = 5;
        let positions = ["P", "P2", "OF", "C", "1B", "2B", "3B", "SS", "OF2", "OF3"];
        let gamepositions = ["P", "C", "1B", "2B", "3B", "SS", "OF"];
        let newPos = [0, 1, 3, 4, 5, 6, 7, 2, 8, 9];
        // let positions = ["G"];
        let SlateID = req.SlateID;
        let user = req.user;
        let operator = req.operator;
        let gametype = req.gametype;


        if (AllTypeTeams.length > 0) {
            allTeams = AllTypeTeams;
            get_builds = get_builds + AllTypeTeams.length;
            console.log(allTeams.length, AllTypeTeams.length, get_builds);
        }

        All_Players = Array.from(new Set(All_Players.map(a => a.PlayerID)))
            .map(PlayerID => {
                return All_Players.find(a => a.PlayerID === PlayerID)
            })

        let LockedTeams = {};
        let stackPlayers = [];
        let SecondstackPlayers = [];
        let no_of_player = 0;
        let orderstatus = 2;
        await PlayerPerTeam.find({ slatId: SlateID, user: user })
            .then(async teams => {
                // console.log("TEams ", teams);
                if (teams.length > 0) {
                    let teamStack = teams[0].teamStack;
                    let batterorder = teams[0].batterorder;
                    teamStack = teamStack.filter(item => item.minNoOfPlayer > 0);
                    teamStack = teamStack.sort((a, b) => {
                        return (b.order - a.order)
                    })
                    // console.log("TEams ", teamStack);
                    let teamStack_length = teamStack.length;

                    for (let i = 0; i < teamStack_length; i++) {

                        // console.log("TEams ", teams[0].orderstatus, teams[0].batterorder,);
                        // console.log("TEams ", teamStack[i].teamId, teamStack[i].minNoOfPlayer);
                        if (teamStack[i].minNoOfPlayer > 0) {
                            orderstatus = teams[0].orderstatus;
                            // console.log("TEams ", orderstatus, batterorder,);
                            // console.log("TEams ", teamStack[i].teamId, teamStack[i].HomeCheckbox, teamStack[i].AwayCheckbox);
                            let isbatterOrder = teamStack[i].HomeCheckbox;
                            // console.log("isbatterOrder",isbatterOrder);
                            if (isbatterOrder == undefined) {
                                // console.log("enter");
                                isbatterOrder = teamStack[i].AwayCheckbox;
                            }
                            // console.log("isbatterOrder2222", isbatterOrder);
                            let Allteam_Players = All_Players.filter(item => item.TeamID == teamStack[i].teamId);
                            if (isbatterOrder == true) {
                                Allteam_Players = Allteam_Players.sort((a, b) => {
                                    return (a.BattingOrder - b.BattingOrder)
                                })
                            } else {
                                Allteam_Players = Allteam_Players.sort((a, b) => {
                                    return (b.DraftKingsProjection - a.DraftKingsProjection)
                                })
                            }

                            // console.log("players", teamStack[i].teamId, Allteam_Players.length, teamStack[i].minNoOfPlayer);
                            // console.log(lockedPlayers.length);
                            if (stackPlayers.length == 0) {
                                no_of_player = teamStack[i].minNoOfPlayer;
                                // console.log("enter 1");

                                if (isbatterOrder == true) {
                                    no_player = teamStack[i].minNoOfPlayer;
                                } else {
                                    no_player = teamStack[i].minNoOfPlayer + 1;
                                }
                                for (let j = 0; j < no_player; j++) {
                                    if (isbatterOrder == true) {
                                        no = batterorder[j] - 1;
                                    } else {
                                        no = j;
                                    }
                                    // console.log(j, no, batterorder[j]);
                                    // console.log(j,no,batterorder[j], Allteam_Players[no].Name, Allteam_Players[no].TeamID,Allteam_Players[no].PlayerID,Allteam_Players[no].BattingOrder, Allteam_Players[no].DraftKingsProjection);
                                    exposurePlayer[Allteam_Players[no].PlayerID] = 1500;
                                    stackPlayers.push(Allteam_Players[no]);

                                }

                            } else {

                                // console.log("enter 2");

                                if (isbatterOrder == true) {
                                    // console.log("enter 3");
                                    // no_of_player = teamStack[i].minNoOfPlayer;
                                    for (let j = 0; j < teamStack[i].minNoOfPlayer; j++) {
                                        no = batterorder[j] - 1;
                                        // console.log(j, no, batterorder[j]);
                                        // console.log(j,no,batterorder[j], Allteam_Players[no].Name, Allteam_Players[no].TeamID,Allteam_Players[no].PlayerID,Allteam_Players[no].BattingOrder, Allteam_Players[no].DraftKingsProjection);
                                        exposurePlayer[Allteam_Players[no].PlayerID] = 1500;
                                        SecondstackPlayers.push(Allteam_Players[no]);
                                    }
                                } else {

                                    Allteam_Players = Allteam_Players.filter(item => item.DraftKingsSalary <= 4000);
                                    // console.log("enter 4",Allteam_Players.length);
                                    for (let j = 0; j < 20; j++) {
                                        let n = Math.floor(Math.random() * Math.floor(Allteam_Players.length));
                                        // console.log(n, Allteam_Players[n].Name, Allteam_Players[n].PlayerID, Allteam_Players[n].DraftKingsSalary, Allteam_Players[n].DraftKingsProjection);
                                        var indexof = SecondstackPlayers.indexOf(Allteam_Players[n]);
                                        if (indexof == -1) {
                                            exposurePlayer[Allteam_Players[n].PlayerID] = 1500;
                                            SecondstackPlayers.push(Allteam_Players[n]);
                                        }
                                        if (SecondstackPlayers.length >= teamStack[i].minNoOfPlayer) {
                                            j = 20;
                                        }
                                    }
                                }
                            }

                            LockedTeams[teamStack[i].teamId] = teamStack[i].minNoOfPlayer;


                        }
                    }
                }
            })
            .catch(error => {
                // console.log("player per team error", error);
                // logger.error("Playerper team" + JSON.stringify(error));

            })


        if (SecondstackPlayers) {
            alockedPlayers = alockedPlayers.concat(SecondstackPlayers);
        }


        let complete_team = 0;
        let count = 0;
        let reqsalary = 49000;
        let teamcreate = 0;
        let l = 1;
        for (let j = 0; j <= no_of_builds; j++) {
            let team = [];
            let select_player = [];
            let teamCount = 1;
            let salary = 50000;
            // console.log("Player Per Team: ",no_of_player);
            if (orderstatus == 1) {
                if (stackPlayers.length > 0) {
                    select_player = stackPlayers;
                }
            } else if (orderstatus == 0) {
                if (stackPlayers.length > 0) {
                    for (let p = 0; p < 20; p++) {
                        let n = Math.floor(Math.random() * Math.floor(no_of_player + 1));
                        // console.log(p,n);
                        var indexof = select_player.indexOf(stackPlayers[n]);
                        if (indexof == -1) {
                            // console.log("player", n);
                            select_player.push(stackPlayers[n]);
                        }

                        if (select_player.length >= no_of_player) {
                            p = 20;
                        }
                    }
                }
            }
            let lockedPlayers = alockedPlayers.concat(select_player);
            // console.log("select_player.lentgh: ",select_player.length,lockedPlayers.length); 
            for (let k = 0; k < positions.length; k++) {
                let position = positions[k];

                // console.log("position: ", position, " k: ", k, "j:", j);
                // let count =0;
                if (position === "P") {
                    P_Players = P_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    // PG_Players = PG_Players.filter(val => !excludePlayers.includes(val));

                    P_Players = P_Players.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection);
                    });

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    let playerCount = {};
                    for (let i = 0; i < length;) {
                        if (P_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {
                                    // console.log("not enter");
                                    // sucess =  firstPLayer(teamArray, PG_Players, team, k, LockedTeams, position);
                                    // i = length;
                                    i++;
                                    continue;

                                }

                            } else {
                                // console.log("nlockfirst");
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                i = length;
                                continue;
                            }


                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("PG_sucessPlayers");
                        // console.log("PG_Players",PG_Players);
                        sucess = firstPLayerpitcher(teamArray, P_Players, team, k, LockedTeams, position);
                    }

                    // console.log("sucess",sucess);

                }

                if (position === "P2") {
                    P_Players = P_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    // SG_Players = SG_Players.filter(val => !excludePlayers.includes(val));

                    P_Players = P_Players.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.DraftKingsSalary;
                    }, 0);
                    let lastPlayerSal = (Math.abs(50000 - teamSalary) / 9);
                    // console.log("last player sal In SG: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    for (let i = 0; i < length;) {
                        if (P_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {
                                    // console.log("not enter");
                                    // sucess =  addtolineup(teamArray, SG_Players, team, k, LockedTeams, position);
                                    // i = length;
                                    i++;
                                    continue;

                                }

                            } else {
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                i = length;
                                continue;
                            }

                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("SG_sucessPlayers");
                        // console.log("PG_Players",PG_Players);
                        sucess = addtolineuppitcher(teamArray, P_Players, team, k, LockedTeams, lastPlayerSal, position);

                    }

                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, P_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    // console.log("sucess",sucess);

                }

                if (position === "C") {
                    C_Players = C_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    // C_Players = C_Players.filter(val => !excludePlayers.includes(val));

                    C_Players = C_Players.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.DraftKingsSalary;
                    }, 0);
                    let lastPlayerSal = (Math.abs(50000 - teamSalary) / 7);
                    // console.log("last player sal In C: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    for (let i = 0; i < length;) {
                        if (C_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes", exposurePlayer[lockedPlayers[i].PlayerID]);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {

                                    i++;
                                    continue;

                                }

                            } else {

                                // console.log("team",team);
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                // console.log("sucess in lock", sucess);
                                i = length;
                                continue;
                            }

                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("C_sucessPlayers");

                        if (lastPlayerSal > 7000) {
                            sucess = lastPlayer(teamArray, C_Players, team, k, LockedTeams, lastPlayerSal, position);
                        } else if (lastPlayerSal < 3500) {
                            sucess = takelowplayer(teamArray, C_Players, team, k, LockedTeams, lastPlayerSal, position);
                        } else {
                            sucess = addtolineup(teamArray, C_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }

                        // if (lastPlayerSal > 7000) {
                        //     sucess = lastPlayer(teamArray, C_Players, team, k, LockedTeams, lastPlayerSal, position);
                        // }
                        // else {
                        //     sucess = addtolineup(teamArray, C_Players, team, k, LockedTeams, lastPlayerSal, position);
                        // }

                    }

                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, C_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    // console.log("sucess",sucess);
                }

                if (position === "1B") {
                    B1_Players = B1_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    // SG_Players = SG_Players.filter(val => !excludePlayers.includes(val));

                    B1_Players = B1_Players.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.DraftKingsSalary;
                    }, 0);
                    let lastPlayerSal = (Math.abs(50000 - teamSalary) / 6);
                    // console.log("last player sal In SG: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    for (let i = 0; i < length;) {
                        if (B1_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes", exposurePlayer[lockedPlayers[i].PlayerID], lockedPlayers[i].PlayerID);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {
                                    // console.log("not enter");
                                    // sucess =  addtolineup(teamArray, SG_Players, team, k, LockedTeams, position);
                                    // i = length;
                                    i++;
                                    continue;

                                }

                            } else {
                                // console.log("enter1");
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                i = length;
                                continue;
                            }

                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("SG_sucessPlayers");
                        // console.log("PG_Players",PG_Players);
                        if (lastPlayerSal > 6500) {
                            sucess = lastPlayer(teamArray, B1_Players, team, k, LockedTeams, lastPlayerSal, position);
                        } else if (lastPlayerSal < 3500) {
                            sucess = takelowplayer(teamArray, B1_Players, team, k, LockedTeams, lastPlayerSal, position);
                        } else {
                            sucess = addtolineup(teamArray, B1_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                        // sucess = addtolineup(teamArray, B1_Players, team, k, LockedTeams, lastPlayerSal, position);

                    }

                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, B1_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    // console.log("sucess",sucess);

                }

                if (position === "2B") {
                    B2_Players = B2_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    // SG_Players = SG_Players.filter(val => !excludePlayers.includes(val));

                    B2_Players = B2_Players.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.DraftKingsSalary;
                    }, 0);
                    let lastPlayerSal = (Math.abs(50000 - teamSalary) / 5);
                    // console.log("last player sal In SG: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    for (let i = 0; i < length;) {
                        if (B2_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes", exposurePlayer[lockedPlayers[i].PlayerID]);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {
                                    // console.log("not enter");
                                    // sucess =  addtolineup(teamArray, SG_Players, team, k, LockedTeams, position);
                                    // i = length;
                                    i++;
                                    continue;

                                }

                            } else {
                                // console.log("enter2");
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                i = length;
                                continue;
                            }

                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("SG_sucessPlayers");
                        // console.log("PG_Players",PG_Players);
                        if (lastPlayerSal > 6500) {
                            sucess = lastPlayer(teamArray, B2_Players, team, k, LockedTeams, lastPlayerSal, position);
                        } else if (lastPlayerSal < 3500) {
                            sucess = takelowplayer(teamArray, B2_Players, team, k, LockedTeams, lastPlayerSal, position);
                        } else {
                            sucess = addtolineup(teamArray, B2_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                        // sucess = addtolineup(teamArray, B2_Players, team, k, LockedTeams, lastPlayerSal, position);

                    }

                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, B2_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    // console.log("sucess",sucess);

                }

                if (position === "3B") {
                    B3_Players = B3_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    // SF_Players = SF_Players.filter(val => !excludePlayers.includes(val));

                    B3_Players = B3_Players.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.DraftKingsSalary;
                    }, 0);
                    let lastPlayerSal = (Math.abs(50000 - teamSalary) / 4);
                    // console.log("last player sal In SF: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    for (let i = 0; i < length;) {
                        if (B3_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes", exposurePlayer[lockedPlayers[i].PlayerID]);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {
                                    // console.log("not enter");
                                    // sucess =  addtolineup(teamArray, SF_Players, team, k, LockedTeams, position);
                                    // i = length;
                                    i++;
                                    continue;

                                }

                            } else {
                                // console.log("enter2");
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                i = length;
                                continue;
                            }
                        }
                        else {
                            // console.log("no",i);
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("SF_sucessPlayers");
                        // console.log("PG_Players",PG_Players);
                        if (lastPlayerSal > 6500) {
                            sucess = lastPlayer(teamArray, B3_Players, team, k, LockedTeams, lastPlayerSal, position);
                        } else if (lastPlayerSal < 3500) {
                            sucess = takelowplayer(teamArray, B3_Players, team, k, LockedTeams, lastPlayerSal, position);
                        } else {
                            sucess = addtolineup(teamArray, B3_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                        // sucess = addtolineup(teamArray, B3_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, B3_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    // console.log("sucess",sucess);

                }

                if (position === "SS") {
                    SS_Players = SS_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    // PF_Players = PF_Players.filter(val => !excludePlayers.includes(val));

                    SS_Players = SS_Players.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.DraftKingsSalary;
                    }, 0);
                    let lastPlayerSal = (Math.abs(50000 - teamSalary) / 3);
                    // console.log("last player sal In PF: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    for (let i = 0; i < length;) {
                        // console.log("yes enter",i);
                        if (SS_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes", exposurePlayer[lockedPlayers[i].PlayerID]);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {
                                    // console.log("not enter");
                                    // sucess =  addtolineup(teamArray, PF_Players, team, k, LockedTeams, position);
                                    // i = length;
                                    i++;
                                    continue;

                                }
                            } else {
                                // console.log("enter2");
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                i = length;
                                continue;
                            }
                        }
                        else {
                            // console.log("no",i);
                            i++;
                        }
                    }

                    //    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("PF_sucessPlayers");
                        // console.log("PG_Players",PG_Players);
                        if (lastPlayerSal > 6500) {
                            sucess = lastPlayer(teamArray, SS_Players, team, k, LockedTeams, lastPlayerSal, position);
                        } else if (lastPlayerSal < 3500) {
                            sucess = takelowplayer(teamArray, SS_Players, team, k, LockedTeams, lastPlayerSal, position);
                        } else {
                            sucess = addtolineup(teamArray, SS_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }

                        // sucess = addtolineup(teamArray, SS_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, SS_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    // console.log("sucess",sucess);

                }

                if (position === "OF") {
                    OF_Players = OF_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    // G_Players = G_Players.filter(val => !excludePlayers.includes(val));

                    OF_Players = OF_Players.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection);
                    });
                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.DraftKingsSalary;
                    }, 0);
                    let lastPlayerSal = (Math.abs(50000 - teamSalary) / 8);

                    // console.log("last team sal in OF: ", lastPlayerSal);
                    // console.log("G_Players",G_Players);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    for (let i = 0; i < length;) {
                        if (OF_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes", exposurePlayer[lockedPlayers[i].PlayerID]);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {
                                    // console.log("not enter");
                                    i++;
                                    continue;
                                }

                            } else {
                                // console.log("enter2");
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                i = length;
                                continue;
                            }
                        }
                        else {
                            // console.log("no");
                            i++;
                            // continue;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("G_sucessPlayers");
                        // console.log("PG_Players",PG_Players);
                        // sucess =  addtolineup(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);

                        if (lastPlayerSal > 5000) {
                            sucess = lastPlayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                        } else if (lastPlayerSal < 3500) {
                            sucess = takelowplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                        } else {
                            sucess = addtolineup(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }


                    }

                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    // console.log("sucess",sucess);

                }

                if (position === "OF2") {
                    OF_Players = OF_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    // F_Players = F_Players.filter(val => !excludePlayers.includes(val));

                    OF_Players = OF_Players.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection);
                    });
                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.DraftKingsSalary;
                    }, 0);
                    let lastPlayerSal = (Math.abs(50000 - teamSalary) / 2);

                    // console.log("last team sal in  oF2: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    for (let i = 0; i < length;) {
                        if (OF_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes", exposurePlayer[lockedPlayers[i].PlayerID]);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {
                                    // console.log("not enter");

                                    i++;
                                    continue;

                                }

                            } else {
                                // console.log("enter2");
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                i = length;
                                continue;
                            }
                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("F_sucessPlayers");
                        // console.log("PG_Players",PG_Players);
                        if (lastPlayerSal > 6500) {
                            sucess = lastPlayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                        } else if (lastPlayerSal < 3500) {
                            sucess = takelowplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                        } else {
                            sucess = addtolineup(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }


                    }

                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    // console.log("sucess",sucess);
                    // addtolineup(teamArray, F_Players, team, k,lastPlayerSal, position);
                    // console.log("in c");
                }

                if (position === "OF3") {
                    OF_Players = OF_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    // UTIL_Players = UTIL_Players.filter(val => !excludePlayers.includes(val));

                    // console.log("in OF3");
                    OF_Players = OF_Players.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection);
                    });
                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.DraftKingsSalary;
                    }, 0);
                    let lastPlayerSal = Math.abs(50000 - teamSalary);
                    // console.log("last player sal in OF3 : ", lastPlayerSal);
                    // console.log("last team sal in of3: ", teamSalary);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    for (let i = 0; i < length;) {
                        if (OF_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes", exposurePlayer[lockedPlayers[i].PlayerID]);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {


                                    i++;
                                    continue;

                                }

                            } else {
                                // console.log("enter2");
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                i = length;
                                continue;
                            }

                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("UTIL_sucessPlayers");

                        sucess = lastPlayerutil(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);

                        // if (lastPlayerSal > 3500) {
                        //     sucess = lastPlayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                        // }
                        // else {
                        //     sucess = lastPlayerutil(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                        // }
                    }

                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    // console.log("sucess",sucess);


                }
            }

            function includelockPLayer(teamArr, playerArr, team, k, position) {


                if (teamArr.filter(el => el.TeamID == playerArr.TeamID).length == 0) {
                    // console.log("Before update: 3");
                    teamArr.push({ PlayerId: playerArr.PlayerID });
                    teamArr.push({ TeamID: playerArr.TeamID, teamCount });
                }
                else {
                    // console.log("Before update: 4");
                    let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr.TeamID));
                    if (teamArr[objIndex].teamCount < 4) {
                        // console.log("Before update: 5");
                        teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                        teamArr.push({ PlayerId: playerArr.PlayerID });
                    }
                    else {
                        // console.log("Before update: 6");
                        return 0;
                    }
                }

                if (complete.filter(el => el.id == playerArr.PlayerID).length == 0) {
                    // console.log("Before update: 1");
                    count = 1;
                    let playerDataWithCount = {
                        id: playerArr.PlayerID,
                        TeamID: playerArr.TeamID,
                        count: count
                    }
                    complete.push(playerDataWithCount);
                }
                else {

                    // console.log("Before update: 2");
                    let objIndex = complete.findIndex((obj => obj.id == playerArr.PlayerID));
                    // console.log("Before update: ", complete[objIndex]);
                    complete[objIndex].count = complete[objIndex].count + 1;
                }

                team[k] = playerArr;
                return 1;
            }

            function firstPLayerpitcher(teamArr, AllplayerArr, team, k, LockedTeams, position) {

                // console.log("first: "); 
                let playerArr = [];


                if (LockedTeams) {
                    // array exists and is not empty
                    // console.log("lockedTeams: Last ", LockedTeams['9']);

                    for (const [key, value] of Object.entries(LockedTeams)) {
                        // console.log(key , value);
                        let array1 = AllplayerArr.filter(obj => {

                            // console.log("array :1 ", obj.TeamID); 
                            return obj.TeamID == key
                        });
                        array1 = Object.assign(array1);
                        playerArr = playerArr.concat(array1);
                        // playerArr.push(array1);
                    }
                }

                playerArr = AllplayerArr.filter(elm => !playerArr.map(elm => JSON.stringify(elm))
                    .includes(JSON.stringify(elm)));

                let playerlength = 0;

                if (playerArr.length > 10) {
                    playerlength = 9;
                } else {
                    playerlength = playerArr.length - 1;
                }

                // console.log("first arrayfinal ", playerArr.length);

                let length = playerArr.length + 30;

                for (let i = 0; i < length;) {
                    let n = Math.floor(Math.random() * Math.floor(playerlength));
                    // console.log("teamId: ", playerArr[n].TeamID);
                    let needvalue = 1.5;

                    if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                        && playerArr[n].DraftKingsProjection >= 3 && playerArr[n].DraftKingsVal >= needvalue) {

                        if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                            teamArr.push({ PlayerId: playerArr[n].PlayerID });
                            teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                        }
                        else {
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                            }
                            else {
                                i++;
                                continue;
                            }
                        }

                        if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                            count = 1;
                            let playerDataWithCount = {
                                id: playerArr[n].PlayerID,
                                TeamID: playerArr[n].TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {
                            let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }

                        salary = salary - playerArr[n].DraftKingsSalary;
                        team[k] = playerArr[n];
                        i = length;
                        // console.log("in compare team: ", team);
                        return 1;
                    }
                    else {
                        i++;
                    }
                }

            }

            function addtolineuppitcher(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position) {

                // console.log("Add to line up: ");
                let addlastPlayerSal = 7000;
                let playerlength = 0;
                let playerArr = [];

                if (LockedTeams) {
                    // array exists and is not empty
                    // console.log("lockedTeams: Last ", LockedTeams['9']);

                    for (const [key, value] of Object.entries(LockedTeams)) {
                        // console.log(key , value);
                        let array1 = AllplayerArr.filter(obj => {

                            // console.log("array :1 ", obj.TeamID); 
                            return obj.TeamID == key
                        });
                        array1 = Object.assign(array1);
                        playerArr = playerArr.concat(array1);
                        // playerArr.push(array1);
                    }
                }

                playerArr = AllplayerArr.filter(elm => !playerArr.map(elm => JSON.stringify(elm))
                    .includes(JSON.stringify(elm)));

                // console.log("playerlength ",playerArr.length);

                if (playerArr.length > 20) {
                    playerlength = 19;
                } else {
                    playerlength = playerArr.length - 1;
                }

                // console.log("playerlength ",playerlength);

                let length = playerArr.length + 30;

                for (let i = 0; i < length;) {
                    let n = Math.floor(Math.random() * Math.floor(playerlength));
                    let needvalue = 1.5;

                    // console.log("teamId: ", playerArr[n].TeamID);
                    // console.log("position: ", n);
                    // console.log("playerArr[n].DraftKingsProjection: ", playerArr[n].DraftKingsProjection,n);
                    if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                        && playerArr[n].DraftKingsProjection >= 3 && playerArr[n].DraftKingsVal >= needvalue) {
                        // console.log("position: enter3 ");
                        if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                            // console.log("position: 3 ");
                            teamArr.push({ PlayerId: playerArr[n].PlayerID });
                            teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                        }
                        else {
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                // console.log("position: 4 ");
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                            }
                            else {
                                // console.log("position: 5 ");
                                i++;
                                continue;
                            }
                        }

                        if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                            // console.log("position: 1 ");
                            count = 1;
                            let playerDataWithCount = {
                                id: playerArr[n].PlayerID,
                                TeamID: playerArr[n].TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {
                            // console.log("position: 2 ");
                            let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }


                        // salary = salary - playerArr[n].DraftKingsSalary;
                        team[k] = playerArr[n];
                        i = length;
                        // console.log("in compare team: ", team);
                        return 1;
                    }
                    else {
                        i++;
                    }
                }

            }

            function takelowplayer(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position) {

                // console.log("low player ");

                let playerArr = [];
                let addlastPlayerSal = 0;
                let playerlength = 0;
                let teamfilter = 0;

                // if (LockedTeams) {
                //     // array exists and is not empty
                //     // console.log("lockedTeams: Last ", LockedTeams['9']);

                //     for (const [key, value] of Object.entries(LockedTeams)) {
                //         // console.log(key , value);
                //         // console.log("teamArr.length: ", teamArr.length); 
                //         // console.log("teamArr.filter(el => el.TeamID == key).length: ", teamArr.filter(el => el.TeamID == key).length); 
                //         if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                //             // console.log("yes:1",);
                //             let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                //             // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                //             if (value > teamArr[objIndex].teamCount) {
                //                 // console.log("Teenter",key); 
                //                 // filter lock teams
                //                 let array1 = AllplayerArr.filter(obj => {

                //                     // console.log("array :1 ", obj.TeamID); 
                //                     return obj.TeamID == key
                //                 });

                //                 array1 = Object.assign(array1);
                //                 playerArr = playerArr.concat(array1);
                //                 // playerArr.push(array1);
                //             }
                //         } else {
                //             // console.log("yes:2",);
                //             // console.log("Teamid",key); 
                //             let array1 = AllplayerArr.filter(obj => {

                //                 // console.log("array :1 ", obj.TeamID); 
                //                 return obj.TeamID == key
                //             });
                //             array1 = Object.assign(array1);
                //             playerArr = playerArr.concat(array1);
                //             // playerArr.push(array1);

                //         }

                //     }
                // }

                // console.log("add arrayfinal before", playerArr.length);
                // playerArr = playerArr.filter(item => item.DraftKingsProjection != 0);
                // playerArr = playerArr.filter(item => item.DraftKingsSalary <= 5000);

                if (playerArr.length == 0) {
                    playerArr = AllplayerArr;
                    addlastPlayerSal = 3500;
                    playerArr = playerArr.filter(item => item.DraftKingsSalary <= addlastPlayerSal);
                    playerArr = playerArr.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection)
                    })
                    if (playerArr.length > 15) {
                        playerlength = 14;
                    } else {
                        playerlength = playerArr.length - 1;
                    }
                    teamfilter = 1;

                } else {
                    addlastPlayerSal = 3500;
                    playerArr = playerArr.filter(item => item.DraftKingsSalary <= addlastPlayerSal);
                    playerArr = playerArr.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection)
                    })

                    playerlength = playerArr.length - 1;
                }

                // console.log("add arrayfinal ", playerArr.length);

                // playerArr = playerArr.filter(item => item.DraftKingsSalary <= 4500);


                let length = playerArr.length + 40;
                // console.log("length ", length);
                if (teamfilter === 1) {
                    for (let i = 0; i < length;) {
                        let n = Math.floor(Math.random() * Math.floor(playerlength));
                        let needvalue = 1;

                        // console.log("teamId: ", playerArr[n].TeamID);
                        // console.log("position: ", n);
                        // console.log("playerArr[n]: ", playerArr[n].DraftKingsProjection,i,n,playerArr[n].DraftKingsVal,playerArr[n].DraftKingsSalary);
                        if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                            && addlastPlayerSal >= playerArr[n].DraftKingsSalary
                            && playerArr[n].DraftKingsProjection >= 5 && playerArr[n].DraftKingsVal >= needvalue) {
                            // console.log("position: enter3 ");
                            if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                // console.log("position: 3 ");
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                            }
                            else {
                                let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                if (teamArr[objIndex].teamCount < 4) {
                                    // console.log("position: 4 ");
                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                }
                                else {
                                    // console.log("position: 5 ");
                                    i++;
                                    continue;
                                }
                            }

                            if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                // console.log("position: 1 ");
                                count = 1;
                                let playerDataWithCount = {
                                    id: playerArr[n].PlayerID,
                                    TeamID: playerArr[n].TeamID,
                                    count: count
                                }
                                complete.push(playerDataWithCount);
                            }
                            else {
                                // console.log("position: 2 ");
                                let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                // console.log("Before update: ", complete[objIndex]);
                                complete[objIndex].count = complete[objIndex].count + 1;
                            }


                            // salary = salary - playerArr[n].DraftKingsSalary;
                            team[k] = playerArr[n];
                            i = length;
                            // console.log("in compare team: ", team);
                            return 1;
                        }
                        else {
                            i++;
                        }
                    }
                } else {

                    playerArr = playerArr.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection);
                    });

                    // length = length + 30;
                    for (let i = 0; i < playerArr.length;) {
                        let n = i;
                        let needvalue = 1;

                        // console.log("teamId: ", playerArr[n].TeamID);
                        // console.log("position: ", n);
                        // console.log("DraftKingsProjection: ", playerArr[n].DraftKingsProjection,i,n,playerArr[n].DraftKingsVal);
                        if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                            && playerArr[n].DraftKingsProjection >= 5 && playerArr[n].DraftKingsVal >= needvalue) {
                            // console.log("position: enter3 ");
                            if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                // console.log("position: 3 ");
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                            }
                            else {
                                let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                if (teamArr[objIndex].teamCount < 4) {
                                    // console.log("position: 4 ");
                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                }
                                else {
                                    // console.log("position: 5 ");
                                    i++;
                                    continue;
                                }
                            }

                            if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                // console.log("position: 1 ");
                                count = 1;
                                let playerDataWithCount = {
                                    id: playerArr[n].PlayerID,
                                    TeamID: playerArr[n].TeamID,
                                    count: count
                                }
                                complete.push(playerDataWithCount);
                            }
                            else {
                                // console.log("position: 2 ");
                                let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                // console.log("Before update: ", complete[objIndex]);
                                complete[objIndex].count = complete[objIndex].count + 1;
                            }


                            // salary = salary - playerArr[n].DraftKingsSalary;
                            team[k] = playerArr[n];
                            i = length;
                            // console.log("in compare team: ", team);
                            return 1;
                        }
                        else {
                            i++;
                        }
                    }
                }
            }

            function firstPLayer(teamArr, AllplayerArr, team, k, LockedTeams, position) {

                // console.log("first: "); 
                let playerArr = [];
                let playerlength = 0;
                let teamfilter = 0;

                if (LockedTeams) {
                    // array exists and is not empty
                    // console.log("lockedTeams: Last ", LockedTeams['9']);

                    for (const [key, value] of Object.entries(LockedTeams)) {
                        // console.log(key , value);
                        if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                            // console.log("yes:",);
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                            // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                            if (value > teamArr[objIndex].teamCount) {
                                // console.log("Teamid",key); 
                                // filter lock teams
                                let array1 = AllplayerArr.filter(obj => {

                                    // console.log("array :1 ", obj.TeamID); 
                                    return obj.TeamID == key
                                });
                                array1 = Object.assign(array1);
                                playerArr = playerArr.concat(array1);
                                // playerArr.push(array1);
                            }
                        } else {
                            // console.log("Teamid",key); 
                            let array1 = AllplayerArr.filter(obj => {

                                // console.log("array :1 ", obj.TeamID); 
                                return obj.TeamID == key
                            });
                            array1 = Object.assign(array1);
                            playerArr = playerArr.concat(array1);
                            // playerArr.push(array1);

                        }

                    }
                }


                // console.log("arrayfinal first ", playerArr.length);
                playerArr = playerArr.filter(item => item.DraftKingsProjection != 0);

                if (playerArr.length == 0) {
                    playerArr = AllplayerArr;
                    playerlength = 5;
                    teamfilter = 1;
                } else {
                    // playerArr = playerArr.filter(item => item.DraftKingsProjection != 0);
                    playerlength = playerArr.length;
                }

                // console.log("first arrayfinal ", playerArr.length);

                let length = playerArr.length + 30;

                if (teamfilter === 1) {

                    for (let i = 0; i < length;) {
                        let n = Math.floor(Math.random() * Math.floor(playerlength));
                        // console.log("teamId: ", playerArr[n].TeamID);
                        let needvalue = 1.5;

                        if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                            && playerArr[n].DraftKingsProjection >= 3 && playerArr[n].DraftKingsVal >= needvalue) {

                            if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                            }
                            else {
                                let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                if (teamArr[objIndex].teamCount < 4) {
                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                }
                                else {
                                    i++;
                                    continue;
                                }
                            }

                            if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                count = 1;
                                let playerDataWithCount = {
                                    id: playerArr[n].PlayerID,
                                    TeamID: playerArr[n].TeamID,
                                    count: count
                                }
                                complete.push(playerDataWithCount);
                            }
                            else {
                                let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                // console.log("Before update: ", complete[objIndex]);
                                complete[objIndex].count = complete[objIndex].count + 1;
                            }

                            salary = salary - playerArr[n].DraftKingsSalary;
                            team[k] = playerArr[n];
                            i = length;
                            // console.log("in compare team: ", team);
                            return 1;
                        }
                        else {
                            i++;
                        }
                    }
                } else {


                    for (let i = 0; i < length;) {
                        let n = Math.floor(Math.random() * Math.floor(playerlength));
                        // console.log("teamId: ", playerArr[n].TeamID,playerArr[n].DraftKingsProjection,playerArr[n].DraftKingsVal);
                        let needvalue = 1;

                        if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                            && playerArr[n].DraftKingsProjection >= 3 && playerArr[n].DraftKingsVal >= needvalue) {

                            if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                            }
                            else {
                                let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                if (teamArr[objIndex].teamCount < 4) {
                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                }
                                else {
                                    i++;
                                    continue;
                                }
                            }

                            if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                count = 1;
                                let playerDataWithCount = {
                                    id: playerArr[n].PlayerID,
                                    TeamID: playerArr[n].TeamID,
                                    count: count
                                }
                                complete.push(playerDataWithCount);
                            }
                            else {
                                let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                // console.log("Before update: ", complete[objIndex]);
                                complete[objIndex].count = complete[objIndex].count + 1;
                            }

                            salary = salary - playerArr[n].DraftKingsSalary;
                            team[k] = playerArr[n];
                            i = length;
                            // console.log("in compare team: ", team);
                            return 1;
                        }
                        else {
                            i++;
                        }
                    }
                }
            }

            function addtolineup(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position) {

                // console.log("Add to line up: ");

                let playerArr = [];
                let addlastPlayerSal = 0;
                let playerlength = 0;
                let teamfilter = 0;

                // if (LockedTeams) {
                //     // array exists and is not empty
                //     // console.log("lockedTeams: Last ", LockedTeams['9']);

                //     for (const [key, value] of Object.entries(LockedTeams)) {
                //         // console.log(key , value);
                //         // console.log("teamArr.length: ", teamArr.length); 
                //         // console.log("teamArr.filter(el => el.TeamID == key).length: ", teamArr.filter(el => el.TeamID == key).length); 
                //         if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                //             // console.log("yes:1",);
                //             let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                //             // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                //             if (value > teamArr[objIndex].teamCount) {
                //                 // console.log("Teenter",key); 
                //                 // filter lock teams
                //                 let array1 = AllplayerArr.filter(obj => {

                //                     // console.log("array :1 ", obj.TeamID); 
                //                     return obj.TeamID == key
                //                 });

                //                 array1 = Object.assign(array1);
                //                 playerArr = playerArr.concat(array1);
                //                 // playerArr.push(array1);
                //             }
                //         } else {
                //             // console.log("yes:2",);
                //             // console.log("Teamid",key); 
                //             let array1 = AllplayerArr.filter(obj => {

                //                 // console.log("array :1 ", obj.TeamID); 
                //                 return obj.TeamID == key
                //             });
                //             array1 = Object.assign(array1);
                //             playerArr = playerArr.concat(array1);
                //             // playerArr.push(array1);

                //         }

                //     }
                // }

                // console.log("add arrayfinal before", playerArr.length);
                // playerArr = playerArr.filter(item => item.DraftKingsProjection != 0);

                if (playerArr.length == 0) {
                    playerArr = AllplayerArr;
                    playerArr = playerArr.filter(item => item.DraftKingsProjection != 0);
                    playerArr = playerArr.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection)
                    })
                    addlastPlayerSal = 9000;
                    if (playerArr.length > 10) {
                        playerlength = 9;
                    } else {
                        playerlength = playerArr.length;
                    }
                    teamfilter = 1;

                } else {

                    playerArr = playerArr.filter(item => item.DraftKingsProjection != 0);
                    playerArr = playerArr.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection)
                    })

                    addlastPlayerSal = 9000;

                    playerlength = playerArr.length - 1;
                }

                // console.log("add arrayfinal ", playerArr.length);



                let length = playerArr.length + 30;
                // console.log("length ", length);
                if (teamfilter === 1) {
                    for (let i = 0; i < length;) {
                        let n = Math.floor(Math.random() * Math.floor(playerlength));
                        let needvalue = 1.5;

                        // console.log("teamId: ", playerArr[n].TeamID);
                        // console.log("position: ", n);
                        // console.log("playerArr[n]: ", playerArr[n].DraftKingsProjection,i,n,playerArr[n].DraftKingsVal);
                        if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                            && addlastPlayerSal >= playerArr[n].DraftKingsSalary
                            && playerArr[n].DraftKingsProjection >= 3 && playerArr[n].DraftKingsVal >= needvalue) {
                            // console.log("position: enter3 ");
                            if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                // console.log("position: 3 ");
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                            }
                            else {
                                let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                if (teamArr[objIndex].teamCount < 4) {
                                    // console.log("position: 4 ");
                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                }
                                else {
                                    // console.log("position: 5 ");
                                    i++;
                                    continue;
                                }
                            }

                            if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                // console.log("position: 1 ");
                                count = 1;
                                let playerDataWithCount = {
                                    id: playerArr[n].PlayerID,
                                    TeamID: playerArr[n].TeamID,
                                    count: count
                                }
                                complete.push(playerDataWithCount);
                            }
                            else {
                                // console.log("position: 2 ");
                                let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                // console.log("Before update: ", complete[objIndex]);
                                complete[objIndex].count = complete[objIndex].count + 1;
                            }


                            // salary = salary - playerArr[n].DraftKingsSalary;
                            team[k] = playerArr[n];
                            i = length;
                            // console.log("in compare team: ", team);
                            return 1;
                        }
                        else {
                            i++;
                        }
                    }
                } else {
                    // length = length + 30;
                    playerArr = playerArr.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection)
                    })

                    for (let i = 0; i < playerArr.length;) {
                        // let n = Math.floor(Math.random() * Math.floor(playerlength));
                        let n = i;
                        let needvalue = 1;

                        // console.log("teamId: ", playerArr[n].TeamID);
                        // console.log("position: ", n);
                        // console.log("DraftKingsProjection: ", playerArr[n].DraftKingsProjection,i,n,playerArr[n].DraftKingsVal);
                        if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0

                            && playerArr[n].DraftKingsProjection >= 3 && playerArr[n].DraftKingsVal >= needvalue) {
                            // console.log("position: enter3 ");
                            if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                // console.log("position: 3 ");
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                            }
                            else {
                                let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                if (teamArr[objIndex].teamCount < 4) {
                                    // console.log("position: 4 ");
                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                }
                                else {
                                    // console.log("position: 5 ");
                                    i++;
                                    continue;
                                }
                            }

                            if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                // console.log("position: 1 ");
                                count = 1;
                                let playerDataWithCount = {
                                    id: playerArr[n].PlayerID,
                                    TeamID: playerArr[n].TeamID,
                                    count: count
                                }
                                complete.push(playerDataWithCount);
                            }
                            else {
                                // console.log("position: 2 ");
                                let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                // console.log("Before update: ", complete[objIndex]);
                                complete[objIndex].count = complete[objIndex].count + 1;
                            }


                            // salary = salary - playerArr[n].DraftKingsSalary;
                            team[k] = playerArr[n];
                            i = length;
                            // console.log("in compare team: ", team);
                            return 1;
                        }
                        else {
                            i++;
                        }
                    }
                }
            }

            function randomplayer(teamArr, playerArr, team, k, LockedTeams, lastPlayerSal, position) {

                // console.log("Random: ");
                let addlastPlayerSal = lastPlayerSal;

                resultA = playerArr.sort((a, b) => {
                    return (b.DraftKingsProjection - a.DraftKingsProjection)
                })

                let length = playerArr.length;
                for (let i = 0; i < length;) {
                    let n = i;
                    let needvalue = 1;
                    // let n = Math.floor(Math.random() * Math.floor(length));
                    // console.log("teamId: ", playerArr[n].TeamID);
                    // console.log("position: ", n);
                    // console.log("salary: ", playerArr[i].DraftKingsSalary);
                    if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                        && addlastPlayerSal <= playerArr[n].DraftKingsSalary
                        && playerArr[n].DraftKingsProjection >= 3 && playerArr[n].DraftKingsVal >= needvalue) {
                        // console.log("position: enter3 ");
                        if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                            // console.log("position: 3 ");
                            teamArr.push({ PlayerId: playerArr[n].PlayerID });
                            teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                        }
                        else {
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                // console.log("position: 4 ");
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                            }
                            else {
                                // console.log("position: 5 ");
                                i++;
                                continue;
                            }
                        }

                        if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                            // console.log("position: 1 ");
                            count = 1;
                            let playerDataWithCount = {
                                id: playerArr[n].PlayerID,
                                TeamID: playerArr[n].TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {
                            // console.log("position: 2 ");
                            let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }


                        // salary = salary - playerArr[n].DraftKingsSalary;
                        team[k] = playerArr[n];
                        i = length;
                        // console.log("in compare team: ", team);
                        return 1;
                    }
                    else {
                        i++;
                    }
                }
            }

            function lastPlayer(teamArr, playerArr, team, k, LockedTeams, lastPlayerSal, position) {

                // console.log("last player: ");

                resultA = playerArr.sort((a, b) => {
                    return (b.DraftKingsSalary - a.DraftKingsSalary) || (b.DraftKingsProjection - a.DraftKingsProjection)
                })
                // console.log("resultA: ",resultA);
                let length = resultA.length + 30;
                let playerlength = resultA.length - 1;
                // console.log("resultA: ",teamCount);
                for (let i = 0; i <= length;) {

                    let l = Math.floor(Math.random() * Math.floor(playerlength));
                    let needvalue = 1;

                    // console.log("result Sallary l: ",resultA[l].DraftKingsSalary);

                    if (teamArr.filter(item => item.PlayerId == resultA[l].PlayerID).length == 0
                        && lastPlayerSal >= resultA[l].DraftKingsSalary
                        && resultA[l].DraftKingsProjection >= 3 && resultA[l].DraftKingsVal >= needvalue) {

                        if (teamArr.filter(el => el.TeamID == resultA[l].TeamID).length == 0) {
                            // console.log("resultA: 3");
                            teamArr.push({ PlayerId: resultA[l].PlayerID });
                            teamArr.push({ TeamID: resultA[l].TeamID, teamCount });
                        }
                        else {
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == resultA[l].TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                // console.log("resultA: 4");
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: resultA[l].PlayerID });
                            }
                            else {
                                // console.log("resultA: 5");
                                i++;
                                continue;
                            }
                        }

                        if (complete.filter(el => el.id == resultA[l].PlayerID).length == 0) {
                            // console.log("resultA: 1");
                            count = 1;
                            let playerDataWithCount = {
                                id: resultA[l].PlayerID,
                                TeamID: resultA[l].TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {
                            // console.log("resultA: 2");
                            let objIndex = complete.findIndex((obj => obj.id == resultA[l].PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }


                        // salary = salary - playerArr[l].DraftKingsSalary;
                        // console.log("teamArr: ",teamArr);
                        team[k] = resultA[l];
                        // console.log("in compare team: ", team);
                        i = length;

                        return 1;

                    }
                    else {
                        i++;
                        continue;
                    }
                }
            }

            function lastPlayerutil(teamArr, playerArr, team, k, LockedTeams, lastPlayerSal, position) {


                // let resultA = playerArr.filter(elm => !teamArr.map(elm => JSON.stringify(elm))
                //     .includes(JSON.stringify(elm)));

                // let resultPLayerA= playerArr.filter(function(cv){
                //     return !teamArr.find(function(e){
                //         return e.PlayerId == cv.PlayerID;
                //     });
                // });

                playerArr = playerArr.filter(item => item.DraftKingsSalary <= lastPlayerSal);

                resultA = playerArr.sort((a, b) => {
                    return (b.DraftKingsSalary - a.DraftKingsSalary) || (b.DraftKingsProjection - a.DraftKingsProjection)
                })

                // console.log("resultA: ",resultA);
                let length = resultA.length - 1;
                // console.log("resultA: ",teamCount);
                for (let i = 0; i <= length;) {
                    let playerlength = 20;
                    let l = i;
                    let needvalue = 1;
                    // console.log("teamId: ", resultA[l].TeamID);
                    // console.log("result inside l: ",l,resultA[l].DraftKingsSalary,resultA[l].Name,resultA[l].DraftKingsProjection,resultA[l].DraftKingsVal);
                    // if (resultA[l].DepthChartOrder == '0') {
                    // console.log("last player result Sallary l: ",resultA[l].DraftKingsSalary,resultA[l].Name,resultA[l].DraftKingsVal);

                    if (teamArr.filter(item => item.PlayerId == resultA[l].PlayerID).length == 0
                        && lastPlayerSal >= resultA[l].DraftKingsSalary
                        && resultA[l].DraftKingsProjection >= 3 && resultA[l].DraftKingsVal >= needvalue) {

                        if (teamArr.filter(el => el.TeamID == resultA[l].TeamID).length == 0) {
                            // console.log("resultA: 3");
                            teamArr.push({ PlayerId: resultA[l].PlayerID });
                            teamArr.push({ TeamID: resultA[l].TeamID, teamCount });
                        }
                        else {
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == resultA[l].TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                // console.log("resultA: 4");
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: resultA[l].PlayerID });
                            }
                            else {
                                // console.log("resultA: 5");
                                i++;
                                continue;
                            }
                        }

                        if (complete.filter(el => el.id == resultA[l].PlayerID).length == 0) {
                            // console.log("resultA: 1");
                            count = 1;
                            let playerDataWithCount = {
                                id: resultA[l].PlayerID,
                                TeamID: resultA[l].TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {
                            // console.log("resultA: 2");
                            let objIndex = complete.findIndex((obj => obj.id == resultA[l].PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }


                        // salary = salary - playerArr[l].DraftKingsSalary;
                        // console.log("teamArr: ",teamArr);
                        team[k] = resultA[l];
                        // console.log("in compare team: ", team);
                        i = length;

                        return 1;

                    }
                    else {
                        i++;
                        continue;
                    }
                    //}else{

                    //  l++;
                    // }
                }
            }

            teamArray = [];

            let teamSalary = team.reduce((acc, item) => {
                // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                return acc + item.DraftKingsSalary;
            }, 0);

            // console.log("team salary", teamSalary);
            let getbuild = l * 30;
            if (j == getbuild) {
                //    // console.log(getbuild,"team",j,complete_team,teamcreate,reqsalary);
                if (complete_team > teamcreate) {
                    reqsalary = reqsalary;
                    teamcreate = complete_team;
                } else {
                    reqsalary = reqsalary - 500;
                    teamcreate = complete_team;
                }
                l = l + 1;
            }

            if (teamSalary <= 50000 && teamSalary >= reqsalary) {
                // console.log("aeraea team salary", teamSalary);
                allTeams.push(team);

                let stringArray = allTeams.map(JSON.stringify);
                let uniqueStringArray = new Set(stringArray);
                allTeams = Array.from(uniqueStringArray, JSON.parse);

                complete_team = allTeams.length;
                // console.log(complete);

                for (const [key, value] of Object.entries(exposurePlayer)) {
                    // console.log(key, value);
                    let newplayerCount = complete.find(item => item.id === key);
                    if (newplayerCount)
                        if (value === newplayerCount.count) {
                            exposurePlayer[key] = 0;
                            delete exposurePlayer[key];
                        }
                }

            } else {

                for (const [key, value] of Object.entries(exposurePlayer)) {
                    // console.log(key, value);
                    exposurePlayer[key] = value + 1;
                }
                // console.log("Exposure players array: ", exposurePlayer);
            }
            // console.log("complete_team: ", complete_team);
            // console.log("get_builds: ", get_builds);
            if (complete_team == get_builds) {
                j = no_of_builds + 1;
            }
        }

        var totalteams = allTeams;
        // console.log("totalteams length", totalteams.length);
        const slatTeamData = {
            Teams: totalteams,
        }
        await SlatPlayers.updateOne({SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, slatTeamData, async (error, doc) => {
            if (error || !doc) {
                console.log("mlb DB error : Slat data update error");
            }
            else {
                console.log("mlb Teams data update");

                allTeams = allTeams.slice(-req.NumberOfBuild);



                let salaryArray = [];
                let projArray = [];
                for (let i = 0; i < allTeams.length; i++) {
                    let teamSalary = 0;
                    let teamProjection = 0;
                    for (let j = 0; j < allTeams[i].length; j++) {
                        // console.log("salary: ", allTeams[i][j].DraftKingsSalary);
                        teamSalary = teamSalary + allTeams[i][j].DraftKingsSalary;
                        teamProjection = teamProjection + allTeams[i][j].DraftKingsProjection;
                    }
                    // console.log("teamProjection",teamProjection);
                    salaryArray[i] = teamSalary;
                    var ProjectionArray = {};
                    Object.assign(ProjectionArray, { teamnumber: i, teamvalue: teamProjection });
                    projArray.push(ProjectionArray);
                }

                let stringArray = allTeams.map(JSON.stringify);
                let uniqueStringArray = new Set(stringArray);
                allTeams = Array.from(uniqueStringArray, JSON.parse);

                let arrangeTeams = [];
                // let positions = ["QB","WR1","WR2","RB1","RB2","WR3","TE","FLEX","DST"];

                for (let i = 0; i < allTeams.length; i++) {
                    let team = [];
                    for (let j = 0; j < allTeams[i].length; j++) {
                        //    // console.log("i",i,"j: ", j,"newPos",newPos[j]);
                        team[j] = allTeams[i][newPos[j]];
                    }
                    arrangeTeams.push(team);
                }

                // console.log("arrangeTeams",arrangeTeams);
                allTeams = arrangeTeams;

                projArray = projArray.sort((a, b) => b.teamvalue - a.teamvalue);

                let projectarrangeTeams = [];
                let projectposition = [];
                for (let i = 0; i < projArray.length; i++) {
                    projectposition.push(projArray[i].teamnumber);
                }

                // console.log("projectposition",projectposition);

                for (let i = 0; i < allTeams.length; i++) {
                    // console.log(projectposition[i]);
                    let newteam = allTeams[projectposition[i]];
                    projectarrangeTeams.push(newteam);
                }

                allTeams = projectarrangeTeams;
                var senddata = {
                    "status": 0,
                    "success": true,
                    "allTeams": allTeams,
                    "salaryArray": salaryArray,
                    "delay": 1000
                }
                // socket.emit('mlbcreatebuild-success', allTeams,WR_Players,QB_Players,RB_Players,TE_Players,FLEX_Players,DST_Players);
                socket.emit('mlbcreatebuild-success', senddata);

                // console.log("allTeams: ", allTeams);
                // res.send({ status: 0, allTeams, salaryArray, B1_Players, B3_Players, OF_Players, B2_Players, SS_Players });
                // res.send({ PG_Players, SG_Players, PF_Players, SF_Players, G_Players, F_Players, UTIL_Players});
            }
        })

    }
    catch (error) {
        console.log(error);
        var response = {
            status: 1, success: false, messages: "something went wrong"
        }
        socket.emit('mlbcreatebuild-success', response);
    }
}



module.exports.socket_create_build_fandual = async function (io, socket, req) {
    try {

        let P_Players = [];
        let C1B_Players = [];
        let B2_Players = [];
        let B3_Players = [];
        let SS_Players = [];
        let OF_Players = [];
        let UTIL_Players = [];
        let complete = [];
        let allTeams = [];
        let All_Players = [];
        let teamArray = [];
        var currentdate = moment().tz("America/New_York").format('YYYY-MM-DDT00:00:00');

        let no_of_builds = 1500;
        let get_builds = req.NumberOfBuild;
        // let get_builds = 5;
        let fandualpositions = ["P", "C/1B", "2B", "3B", "SS", "OF", "UTIL"];
        let positions = ["P", "OF", "C/1B", "2B", "3B", "SS", "OF2", "OF3", "UTIL"];
        let newPos = [0, 2, 3, 4, 5, 1, 6, 7, 8];
        // let positions = ["G"];
        let SlateID = req.SlateID;
        let user = req.user;
        // let user = "603f1f85e9539b7d08bc7ed4";
        // let SlateID = "12389";
        let operator = req.operator;
        let gametype = req.gametype;
        // console.log("user: ", user);
        // console.log("SlateID: ", SlateID);
        // console.log("NumberOfBuild: ", get_builds); 

        //     await  PlayerExposure.find({slatId : SlateID, user : user, type : "lock"})
        //     .then(async lockplayers =>{
        // if(lockplayers.length === 0){

        //     return res.send({ status : 2, success: false, messages: "Please lock atleast one player" });
        // }else{
        await PlayerExposure.distinct("slatePlayerID", { slatId: SlateID, user: user, type: "exclude" })
            .then(async exposureplayers => {

                for (let k = 0; k < fandualpositions.length; k++) {
                    let position = fandualpositions[k];
                    // let count =0;
                    // console.log("position: ", position, " k: ", k);
                    await Slats.aggregate([{ "$match": { "SlateID": SlateID } },
                    { "$unwind": "$PlayerId" }, { "$unwind": "$PlayerId.OperatorRosterSlots" },
                    { "$match": { "PlayerId.OperatorRosterSlots": position } },
                    { "$project": { "PlayerId": "$PlayerId", "_id": 0 } }
                    ])
                        .then(async result => {
                            // console.log("resultlength: ", result.length);

                            let allPlayers = [];
                            let playerslat = {};
                            for (let i = 0; i < result.length; i++) {
                                allPlayers[i] = result[i].PlayerId.PlayerID;
                                playerslat[result[i].PlayerId.PlayerID] = {
                                    "sallary": result[i].PlayerId.OperatorSalary1,
                                    "slatid": result[i].PlayerId.OperatorSlatePlayerID
                                }
                            }
                            // console.log( "length: ",allPlayers.length), Day: { $eq: currentdate }
                            // res.send({allPlayers});
                            await PlayerStats.find({ PlayerID: { $in: allPlayers }, SportId: 2 }, {
                                SportType: 1, SportId: 1, PlayerID: 1, DepthChartOrder: 1, Day: 1,
                                DepthChartPosition: 1, DraftKingsName: 1, Name: 1, InjuryStatus: 1,
                                InjuryStartDate: 1, InjuryBodyPart: 1, InjuryNotes: 1, DraftKingsProjection: 1, BattingOrder: 1,
                                DraftKingsPosition: 1, HomeOrAway: 1, FandDualProjection: 1, FPPDdraftking: 1, FPPDfanduel: 1,
                                PhotoUrl: 1, DraftKingsSalary: 1, FanDuelSalary: 1, Status: 1, TeamID: 1, FPPG: 1, FanDuelPosition: 1,
                                DraftKingsVal: 1, FanDualVal: 1, Games: 1, FantasyPoints: 1, Team: 1, SlatePlayerID: 1, _id: 0
                            })
                                .then(async players => {
                                    // console.log("palyers.length: ", players.length);  
                                    // res.send({players});
                                    let i = 0;
                                    let n = 0;
                                    while (n < players.length) {

                                        let doc = players[n];

                                        let logo = await PlayerProjection.findOne({ playerId: doc.PlayerID, slatId: req.SlateID, user: req.user }, { projection: 1 });
                                        // console.log("logo",logo);
                                        if (logo != null) {
                                            // console.log("logo",logo);
                                            // console.log("logo",logo.projection);
                                            // player = player.toJSON();
                                            doc.DraftKingsProjection = logo.projection;
                                            doc.FandDualProjection = logo.projection;
                                            // console.log(doc.FandDualProjection);
                                        }

                                        if (doc !== null && position != "P" && doc.FanDuelSalary > 1 && doc.FandDualProjection > 0.1) {
                                            if (doc.InjuryStatus !== "Out") {
                                                if (playerslat[doc.PlayerID].slatid != "") {
                                                    doc["SlatePlayerID"] = playerslat[doc.PlayerID].slatid;
                                                }
                                                doc["DraftKingsSalary"] = playerslat[doc.PlayerID].sallary;
                                                doc["FanDuelSalary"] = playerslat[doc.PlayerID].sallary;
                                                var indexof = exposureplayers.indexOf(doc.SlatePlayerID);
                                                if (indexof == -1) {

                                                    All_Players.push(doc);
                                                }

                                            }
                                        }

                                        if (doc !== null && position === "P" && doc.FanDuelSalary > 1 && doc.FandDualProjection > 0.1) {
                                            if (doc.InjuryStatus !== "Out") {
                                                if (playerslat[doc.PlayerID].slatid != "") {
                                                    doc["SlatePlayerID"] = playerslat[doc.PlayerID].slatid;
                                                }
                                                doc["DraftKingsSalary"] = playerslat[doc.PlayerID].sallary;
                                                doc["FanDuelSalary"] = playerslat[doc.PlayerID].sallary;
                                                // console.log("doc: ", doc);
                                                var indexof = exposureplayers.indexOf(doc.SlatePlayerID);
                                                if (indexof == -1) {

                                                    P_Players.push(doc);
                                                }
                                            }
                                        } else if (doc !== null && position === "C/1B" && doc.FanDuelSalary > 1 && doc.FandDualProjection > 0.1) {
                                            if (doc.InjuryStatus !== "Out") {
                                                if (playerslat[doc.PlayerID].slatid != "") {
                                                    doc["SlatePlayerID"] = playerslat[doc.PlayerID].slatid;
                                                }
                                                doc["DraftKingsSalary"] = playerslat[doc.PlayerID].sallary;
                                                doc["FanDuelSalary"] = playerslat[doc.PlayerID].sallary;
                                                // console.log("doc: ", doc);
                                                var indexof = exposureplayers.indexOf(doc.SlatePlayerID);
                                                if (indexof == -1) {

                                                    C1B_Players.push(doc);
                                                }
                                            }
                                        } else if (doc !== null && position === "2B" && doc.FanDuelSalary > 1 && doc.FandDualProjection > 0.1) {
                                            if (doc.InjuryStatus !== "Out") {
                                                if (playerslat[doc.PlayerID].slatid != "") {
                                                    doc["SlatePlayerID"] = playerslat[doc.PlayerID].slatid;
                                                }
                                                doc["DraftKingsSalary"] = playerslat[doc.PlayerID].sallary;
                                                doc["FanDuelSalary"] = playerslat[doc.PlayerID].sallary;
                                                // console.log("doc: ", doc);
                                                var indexof = exposureplayers.indexOf(doc.SlatePlayerID);
                                                if (indexof == -1) {

                                                    B2_Players.push(doc);
                                                }
                                            }

                                        } else if (doc !== null && position === "3B" && doc.FanDuelSalary > 1 && doc.FandDualProjection > 0.1) {
                                            if (doc.InjuryStatus !== "Out") {
                                                if (playerslat[doc.PlayerID].slatid != "") {
                                                    doc["SlatePlayerID"] = playerslat[doc.PlayerID].slatid;
                                                }
                                                doc["DraftKingsSalary"] = playerslat[doc.PlayerID].sallary;
                                                doc["FanDuelSalary"] = playerslat[doc.PlayerID].sallary;
                                                // console.log("doc: ", doc);
                                                var indexof = exposureplayers.indexOf(doc.SlatePlayerID);
                                                if (indexof == -1) {

                                                    B3_Players.push(doc);
                                                }
                                            }
                                        } else if (doc !== null && position === "SS" && doc.FanDuelSalary > 1 && doc.FandDualProjection > 0.1) {
                                            if (doc.InjuryStatus !== "Out") {
                                                if (playerslat[doc.PlayerID].slatid != "") {
                                                    doc["SlatePlayerID"] = playerslat[doc.PlayerID].slatid;
                                                }
                                                doc["DraftKingsSalary"] = playerslat[doc.PlayerID].sallary;
                                                doc["FanDuelSalary"] = playerslat[doc.PlayerID].sallary;
                                                // console.log("doc: ", doc);
                                                var indexof = exposureplayers.indexOf(doc.SlatePlayerID);
                                                if (indexof == -1) {

                                                    SS_Players.push(doc);
                                                }
                                            }
                                        } else if (doc !== null && position === "OF" && doc.FanDuelSalary > 1 && doc.FandDualProjection > 0.1) {
                                            if (doc.InjuryStatus !== "Out") {
                                                if (playerslat[doc.PlayerID].slatid != "") {
                                                    doc["SlatePlayerID"] = playerslat[doc.PlayerID].slatid;
                                                }
                                                doc["DraftKingsSalary"] = playerslat[doc.PlayerID].sallary;
                                                doc["FanDuelSalary"] = playerslat[doc.PlayerID].sallary;
                                                // console.log("doc: ", doc);
                                                var indexof = exposureplayers.indexOf(doc.SlatePlayerID);
                                                if (indexof == -1) {

                                                    OF_Players.push(doc);
                                                }
                                            }
                                        } else if (doc !== null && position === "UTIL" && doc.FanDuelSalary > 1 && doc.FandDualProjection > 0.1) {
                                            if (doc.InjuryStatus !== "Out") {
                                                if (playerslat[doc.PlayerID].slatid != "") {
                                                    doc["SlatePlayerID"] = playerslat[doc.PlayerID].slatid;
                                                }
                                                doc["DraftKingsSalary"] = playerslat[doc.PlayerID].sallary;
                                                doc["FanDuelSalary"] = playerslat[doc.PlayerID].sallary;
                                                // console.log("doc: ", doc);
                                                var indexof = exposureplayers.indexOf(doc.SlatePlayerID);
                                                if (indexof == -1) {

                                                    UTIL_Players.push(doc);
                                                }

                                            }
                                        }

                                        n++;
                                    }

                                    // })
                                    // res.send({players});
                                })

                        })
                        .catch(error => {
                            // console.log("error: ", error);
                            res.send({ error });
                        })
                }


                All_Players = Array.from(new Set(All_Players.map(a => a.PlayerID)))
                    .map(PlayerID => {
                        return All_Players.find(a => a.PlayerID === PlayerID)
                    })

                // console.log("All_NewPlayers",All_Players.length);



                let LockedTeams = {};
                let alockedPlayers = [];
                let stackPlayers = [];
                let SecondstackPlayers = [];
                let exposurePlayer = {};
                let excludePlayers = [];
                let no_of_player = 0;
                let orderstatus = 0;

                await PlayerPerTeam.find({ slatId: SlateID, user: user })
                    .then(async teams => {
                        // console.log("TEams ", teams);
                        if (teams.length > 0) {
                            let teamStack = teams[0].teamStack;
                            let batterorder = teams[0].batterorder;
                            teamStack = teamStack.filter(item => item.minNoOfPlayer > 0);
                            teamStack = teamStack.sort((a, b) => {
                                return (b.order - a.order)
                            })
                            // console.log("TEams ", teamStack);
                            let teamStack_length = teamStack.length;
                            for (let i = 0; i < teamStack_length; i++) {
                                // console.log("TEams ", teams[0].orderstatus, teams[0].batterorder,);
                                // console.log("TEams ", teamStack[i].teamId, teamStack[i].minNoOfPlayer);
                                if (teamStack[i].minNoOfPlayer > 0) {
                                    orderstatus = teams[0].orderstatus;
                                    // console.log("TEams ", orderstatus, batterorder,);
                                    // console.log("TEams ", teamStack[i].teamId, teamStack[i].minNoOfPlayer);
                                    // console.log("TEams ", teamStack[i].teamId, teamStack[i].HomeCheckbox, teamStack[i].AwayCheckbox);
                                    let isbatterOrder = teamStack[i].HomeCheckbox;
                                    // console.log("isbatterOrder",isbatterOrder);
                                    if (isbatterOrder == undefined) {
                                        // console.log("enter");
                                        isbatterOrder = teamStack[i].AwayCheckbox;
                                    }
                                    // console.log("isbatterOrder2222", isbatterOrder);
                                    let Allteam_Players = All_Players.filter(item => item.TeamID == teamStack[i].teamId);
                                    if (isbatterOrder == true) {
                                        Allteam_Players = Allteam_Players.sort((a, b) => {
                                            return (a.BattingOrder - b.BattingOrder)
                                        })
                                    } else {
                                        Allteam_Players = Allteam_Players.sort((a, b) => {
                                            return (b.FandDualProjection - a.FandDualProjection)
                                        })
                                    }

                                    // console.log("players", teamStack[i].teamId, teamStack[i].minNoOfPlayer);
                                    // console.log(lockedPlayers.length);
                                    if (stackPlayers.length == 0) {
                                        no_of_player = teamStack[i].minNoOfPlayer;
                                        // console.log("enter 1");

                                        if (isbatterOrder == true) {
                                            no_player = teamStack[i].minNoOfPlayer;
                                        } else {
                                            no_player = teamStack[i].minNoOfPlayer + 1;
                                        }
                                        for (let j = 0; j < no_player; j++) {
                                            if (isbatterOrder == true) {
                                                no = batterorder[j] - 1;
                                            } else {
                                                no = j;
                                            }
                                            // console.log(j, no, batterorder[j]);
                                            // console.log(j,no,batterorder[j], Allteam_Players[no].Name, Allteam_Players[no].TeamID,Allteam_Players[no].PlayerID,Allteam_Players[no].FanDuelSalary,Allteam_Players[no].BattingOrder, Allteam_Players[no].DepthChartPosition);
                                            exposurePlayer[Allteam_Players[no].PlayerID] = 1500;
                                            stackPlayers.push(Allteam_Players[no]);

                                        }

                                    } else {

                                        // console.log("enter 2");

                                        if (isbatterOrder == true) {
                                            // console.log("enter 3");
                                            // no_of_player = teamStack[i].minNoOfPlayer;
                                            for (let j = 0; j < teamStack[i].minNoOfPlayer; j++) {
                                                no = batterorder[j] - 1;
                                                // console.log(j, no, batterorder[j]);
                                                // console.log(j,no,batterorder[j], Allteam_Players[no].Name, Allteam_Players[no].TeamID,Allteam_Players[no].PlayerID,Allteam_Players[no].FanDuelSalary, Allteam_Players[no].BattingOrder, Allteam_Players[no].DepthChartPosition);
                                                exposurePlayer[Allteam_Players[no].PlayerID] = 1500;
                                                SecondstackPlayers.push(Allteam_Players[no]);
                                            }
                                        } else {

                                            Allteam_Players = Allteam_Players.filter(item => item.FanDuelSalary <= 4000);
                                            // console.log("enter 4",Allteam_Players.length);
                                            for (let j = 0; j < 20; j++) {
                                                let n = Math.floor(Math.random() * Math.floor(Allteam_Players.length));
                                                // console.log(n, Allteam_Players[n].Name, Allteam_Players[n].PlayerID, Allteam_Players[n].FanDuelSalary, Allteam_Players[no].BattingOrder, Allteam_Players[no].DepthChartPosition);
                                                var indexof = SecondstackPlayers.indexOf(Allteam_Players[n]);
                                                if (indexof == -1) {
                                                    exposurePlayer[Allteam_Players[n].PlayerID] = 1500;
                                                    SecondstackPlayers.push(Allteam_Players[n]);
                                                }
                                                if (SecondstackPlayers.length >= teamStack[i].minNoOfPlayer) {
                                                    j = 20;
                                                }
                                            }
                                        }
                                    }

                                    // if (stackPlayers.length == 0) {
                                    //     no_of_player = teamStack[i].minNoOfPlayer
                                    //     for (let j = 0; j < teamStack[i].minNoOfPlayer + 1; j++) {
                                    //         if (orderstatus == 1) {
                                    //             no = batterorder[j] - 1;
                                    //         } else {
                                    //             no = j;
                                    //         }
                                    //         // console.log(j, batterorder[j], Allteam_Players[no].Name, Allteam_Players[no].PlayerID, Allteam_Players[no].FanDuelSalary, Allteam_Players[no].BattingOrder, Allteam_Players[no].DepthChartPosition);

                                    //         exposurePlayer[Allteam_Players[no].PlayerID] = 1500;
                                    //         stackPlayers.push(Allteam_Players[no]);

                                    //     }

                                    // } else {

                                    //     Allteam_Players = Allteam_Players.filter(item => item.FanDuelSalary <= 6000);

                                    //     for (let j = 0; j < teamStack[i].minNoOfPlayer; j++) {

                                    //         let n = Math.floor(Math.random() * Math.floor(Allteam_Players.length));
                                    //         // console.log(n, Allteam_Players[n].Name, Allteam_Players[n].PlayerID,Allteam_Players[n].FanDuelSalary, Allteam_Players[n].DraftKingsProjection);
                                    //         exposurePlayer[Allteam_Players[n].PlayerID] = 1500;
                                    //         SecondstackPlayers.push(Allteam_Players[n]);

                                    //     }

                                    // }

                                    LockedTeams[teamStack[i].teamId] = teamStack[i].minNoOfPlayer;


                                }
                            }
                        }
                    })
                    .catch(error => {
                        // console.log("player per team error",error);
                        // logger.error("Playerper team" + JSON.stringify(error));

                    })

                if (SecondstackPlayers) {
                    alockedPlayers = alockedPlayers.concat(SecondstackPlayers);
                }

                // console.log("Player Per Team Lockeduserteam: ", Lockeduserteam);
                // console.log("Player Per Team: ", LockedTeams);

                await PlayerExposure.find({ slatId: SlateID, user: user, type: "exclude" })
                    .then(async players => {
                        let exclude_length = players.length;
                        for (let i = 0; i < exclude_length; i++) {
                            await PlayerStats.findOne({ PlayerID: players[i].playerId },
                                {
                                    SportType: 1, SportId: 1, PlayerID: 1, DepthChartOrder: 1,
                                    DepthChartPosition: 1, DraftKingsName: 1, Name: 1, InjuryStatus: 1,
                                    InjuryStartDate: 1, InjuryBodyPart: 1, InjuryNotes: 1, DraftKingsProjection: 1,
                                    DraftKingsPosition: 1, HomeOrAway: 1, FandDualProjection: 1, FPPDdraftking: 1, FPPDfanduel: 1,
                                    PhotoUrl: 1, DraftKingsSalary: 1, FanDuelSalary: 1, Status: 1, TeamID: 1, FPPG: 1, FanDuelPosition: 1,
                                    DraftKingsVal: 1, FanDualVal: 1, Games: 1, FantasyPoints: 1, Team: 1, SlatePlayerID: 1, _id: 0
                                })
                                .then(async doc => {
                                    if (players[i].slatePlayerID != "") {
                                        doc["SlatePlayerID"] = players[i].slatePlayerID;
                                    }

                                    let logo = await PlayerProjection.findOne({ playerId: doc.PlayerID, slatId: req.SlateID, user: req.user }, { projection: 1 });
                                    // console.log("logo",logo);
                                    if (logo != null) {
                                        // console.log("logo",logo);
                                        // console.log("logo",logo.projection);
                                        // player = player.toJSON();
                                        doc.DraftKingsProjection = logo.projection;
                                        doc.FandDualProjection = logo.projection;
                                    }

                                    doc["DraftKingsSalary"] = players[i].sallary;
                                    doc["FanDuelSalary"] = players[i].sallary;

                                    excludePlayers.push(doc);

                                })
                        }


                    })
                    .catch(error => {
                        // console.log("exclude data find error");
                    })

                // console.log("exclude players array: ", excludePlayers);


                await PlayerExposure.find({ slatId: SlateID, user: user, type: { $ne: "exclude" } })
                    .then(async players => {
                        let exclude_length = players.length;
                        for (let i = 0; i < exclude_length; i++) {

                            if (players[i].type == "lock") {

                                exposurePlayer[players[i].playerId] = 1500;

                            } else {

                                var totalper = 0;
                                if (players[i].min > players[i].max) {
                                    totalper = players[i].min;
                                } else {
                                    totalper = players[i].max;
                                }

                                // console.log("totalper",players[i].playerId,totalper);

                                let inlineup = Math.round(Math.abs(totalper / 10));
                                inlineup = (inlineup * get_builds) / 10;
                                exposurePlayer[players[i].playerId] = Math.round(inlineup);
                            }

                            // exposurePlayer.push(inlineCount);
                            await PlayerStats.findOne({ PlayerID: players[i].playerId },
                                {
                                    SportType: 1, SportId: 1, PlayerID: 1, DepthChartOrder: 1,
                                    DepthChartPosition: 1, DraftKingsName: 1, Name: 1, InjuryStatus: 1,
                                    InjuryStartDate: 1, InjuryBodyPart: 1, InjuryNotes: 1, DraftKingsProjection: 1,
                                    DraftKingsPosition: 1, HomeOrAway: 1, FandDualProjection: 1, FPPDdraftking: 1, FPPDfanduel: 1,
                                    PhotoUrl: 1, DraftKingsSalary: 1, FanDuelSalary: 1, Status: 1, TeamID: 1, FPPG: 1, FanDuelPosition: 1,
                                    DraftKingsVal: 1, FanDualVal: 1, Games: 1, FantasyPoints: 1, Team: 1, SlatePlayerID: 1, _id: 0
                                })
                                .then(async doc => {
                                    if (players[i].slatePlayerID != "") {
                                        doc["SlatePlayerID"] = players[i].slatePlayerID;
                                    }

                                    let logo = await PlayerProjection.findOne({ playerId: doc.PlayerID, slatId: req.SlateID, user: req.user }, { projection: 1 });
                                    // console.log("logo",logo);
                                    if (logo != null) {
                                        // console.log("logo",logo);
                                        // console.log("logo",logo.projection);
                                        // player = player.toJSON();
                                        doc.DraftKingsProjection = logo.projection;
                                        doc.FandDualProjection = logo.projection;
                                    }

                                    alockedPlayers.push(doc);

                                })
                        }


                    })
                    .catch(error => {
                        // console.log("exclude locked data find error");
                    })

                let playerByPosition = {};
                let isLineUpCreated = await SlatPlayers.findOne({ SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, { SportId: 1 });
                console.log("logo", isLineUpCreated);

                playerByPosition.P = P_Players;
                playerByPosition.C1B = C1B_Players;
                playerByPosition.SS = SS_Players;
                playerByPosition.OF = OF_Players;
                playerByPosition.UTIL = UTIL_Players;
                playerByPosition.B2 = B2_Players;
                playerByPosition.B3 = B3_Players;
                playerByPosition.All = All_Players;
                playerByPosition.Lock = alockedPlayers;
                playerByPosition.Exclude = excludePlayers;
                playerByPosition.Exposure = exposurePlayer;

                if (isLineUpCreated != null) {

                    const slatPlayerData = {
                        Players: playerByPosition,
                    }
                    await SlatPlayers.update({SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, slatPlayerData, (error, doc) => {
                        if (error || !doc) {
                            console.log("mlb DB error : Slat data update error");
                        }
                        else {
                            console.log("mlb Player data update");
                        }
                    })
                } else {
                    const slatPlayerData = new SlatPlayers({
                        SportType: "MLB",
                        SportId: "2",
                        SlatID: req.SlateID,
                        UserId: req.user,
                        Players: playerByPosition,

                    })
                    await slatPlayerData.save((error, doc) => {
                        if (error || !doc) {
                            console.log(error);
                        }
                        else {
                            console.log("mlb mlb player data added");
                        }
                    });
                }

                // console.log("Locked players array: ", alockedPlayers, stackPlayers);
                // console.log("Exposure players array: ", exposurePlayer);
                // console.log("PF players array: ", PF_Players);

                let complete_team = 0;
                let count = 0;
                let reqsalary = 34000;
                let teamcreate = 0;
                let l = 1;
                for (let j = 0; j <= no_of_builds; j++) {
                    let team = [];
                    let select_player = [];
                    let teamCount = 1;
                    // let complete_team = 0;
                    let salary = 35000;
                    if (orderstatus == 1) {
                        if (stackPlayers.length > 0) {
                            select_player = stackPlayers;
                        }

                    } else {
                        if (stackPlayers.length > 0) {
                            for (let p = 0; p < 20; p++) {
                                let n = Math.floor(Math.random() * Math.floor(no_of_player + 1));
                                // console.log(p,n);
                                var indexof = select_player.indexOf(stackPlayers[n]);
                                if (indexof == -1) {
                                    // console.log("player", n);
                                    select_player.push(stackPlayers[n]);
                                }

                                if (select_player.length >= no_of_player) {
                                    p = 20;
                                }
                            }
                        }
                    }
                    let lockedPlayers = alockedPlayers.concat(select_player);
                    // console.log("select_player.lentgh: ",select_player.length,lockedPlayers.length,lockedPlayers); 
                    for (let k = 0; k < positions.length; k++) {
                        let position = positions[k];
                        // console.log("position: ", position, " k: ", k, "j:", j);

                        if (position === "P") {
                            P_Players = P_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                .includes(JSON.stringify(elm)));


                            P_Players = P_Players.sort((a, b) => {
                                return (b.FandDualProjection - a.FandDualProjection);
                            });

                            let teamSalary = team.reduce((acc, item) => {
                                // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                return acc + item.FanDuelSalary;
                            }, 0);

                            let lastPlayerSal = (Math.abs(35000 / 9));
                            // console.log("last player sal In P: ", lastPlayerSal);  

                            let length = lockedPlayers.length;
                            let sucess = 0;
                            for (let i = 0; i < length;) {
                                if (P_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                    // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                                    let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                    if (j != 0) {
                                        playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                        if (!playerCount) {
                                            newcount = 0;
                                        } else {
                                            newcount = playerCount.count;
                                        }
                                        // console.log("Count",playerCount);
                                        // console.log("onlyCount", newcount);
                                        if (newcount < playerexpo) {
                                            // console.log("enter");
                                            sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                            i = length;
                                            continue;
                                        } else {
                                            // console.log("not enter");

                                            i++;
                                            continue;

                                        }

                                    } else {
                                        // console.log("team",team);
                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                        // console.log("sucess in lock",sucess);
                                        i = length;
                                        continue;
                                    }

                                }
                                else {
                                    // console.log("no");
                                    i++;
                                }
                            }


                            // console.log("sucess1",sucess);

                            if (sucess == 0) {
                                // console.log("C_sucessPlayers");
                                sucess = firstPLayerpitcher(teamArray, P_Players, team, k, LockedTeams, lastPlayerSal, position);

                            }

                            if (sucess == null) {
                                // console.log("sucess second in SG",sucess);
                                sucess = randomplayer(teamArray, P_Players, team, k, LockedTeams, lastPlayerSal, position);
                            }

                            // console.log("sucess",sucess);
                        }

                        if (position === "C/1B") {
                            C1B_Players = C1B_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                .includes(JSON.stringify(elm)));


                            C1B_Players = C1B_Players.sort((a, b) => {
                                return (b.FandDualProjection - a.FandDualProjection);
                            });

                            let teamSalary = team.reduce((acc, item) => {
                                // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                return acc + item.FanDuelSalary;
                            }, 0);

                            let remainingplayer = positions.length - k;
                            // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                            let lastPlayerSal = (Math.abs(35000 - teamSalary) / remainingplayer);

                            // console.log("last player sal In C/1B: ", lastPlayerSal);

                            let length = lockedPlayers.length;
                            let sucess = 0;
                            for (let i = 0; i < length;) {
                                if (C1B_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                    // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                                    let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                    if (j != 0) {
                                        playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                        if (!playerCount) {
                                            newcount = 0;
                                        } else {
                                            newcount = playerCount.count;
                                        }
                                        // console.log("Count",playerCount);
                                        // console.log("onlyCount", newcount);
                                        if (newcount < playerexpo) {
                                            // console.log("enter");
                                            sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                            i = length;
                                            continue;
                                        } else {
                                            // console.log("not enter");
                                            // sucess =  addtolineup(teamArray, PF_Players, team, k, LockedTeams, position);
                                            // i = length;
                                            i++;
                                            continue;

                                        }

                                    } else {
                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                        i = length;
                                        continue;
                                    }
                                }
                                else {
                                    // console.log("no");
                                    i++;
                                }
                            }

                            // console.log("sucess1",sucess);

                            if (sucess == 0) {
                                // console.log("PF_sucessPlayers");
                                if (lastPlayerSal > 4500) {
                                    sucess = lastPlayer(teamArray, C1B_Players, team, k, LockedTeams, lastPlayerSal, position);
                                } else if (lastPlayerSal < 3000) {
                                    sucess = takelowplayer(teamArray, C1B_Players, team, k, LockedTeams, lastPlayerSal, position);
                                }
                                else {
                                    sucess = addtolineup(teamArray, C1B_Players, team, k, LockedTeams, lastPlayerSal, position);
                                }


                            }

                            if (sucess == null) {
                                // console.log("sucess second in SG",sucess);
                                sucess = randomplayer(teamArray, C1B_Players, team, k, LockedTeams, lastPlayerSal, position);
                            }

                            // console.log("sucess",sucess);

                        }

                        if (position === "2B") {
                            B2_Players = B2_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                .includes(JSON.stringify(elm)));


                            B2_Players = B2_Players.sort((a, b) => {
                                return (b.FandDualProjection - a.FandDualProjection);
                            });

                            let teamSalary = team.reduce((acc, item) => {
                                // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                return acc + item.FanDuelSalary;
                            }, 0);

                            let remainingplayer = positions.length - k;
                            // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                            let lastPlayerSal = (Math.abs(35000 - teamSalary) / remainingplayer);

                            // console.log("last player sal In 2B: ", lastPlayerSal);

                            let length = lockedPlayers.length;
                            let sucess = 0;
                            for (let i = 0; i < length;) {
                                if (B2_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                    // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                                    let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                    if (j != 0) {
                                        playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                        if (!playerCount) {
                                            newcount = 0;
                                        } else {
                                            newcount = playerCount.count;
                                        }
                                        // console.log("Count",playerCount);
                                        // console.log("onlyCount", newcount);
                                        if (newcount < playerexpo) {
                                            // console.log("enter");
                                            sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                            i = length;
                                            continue;
                                        } else {
                                            // console.log("not enter");
                                            // sucess =  addtolineup(teamArray, SF_Players, team, k, LockedTeams, position);
                                            // i = length;
                                            i++;
                                            continue;

                                        }

                                    } else {
                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                        i = length;
                                        continue;
                                    }
                                }
                                else {
                                    // console.log("no");
                                    i++;
                                }
                            }

                            // console.log("sucess1",sucess);

                            if (sucess == 0) {
                                // console.log("SF_sucessPlayers");

                                if (lastPlayerSal > 4500) {
                                    sucess = lastPlayer(teamArray, B2_Players, team, k, LockedTeams, lastPlayerSal, position);
                                } else if (lastPlayerSal < 3000) {
                                    sucess = takelowplayer(teamArray, B2_Players, team, k, LockedTeams, lastPlayerSal, position);
                                }
                                else {
                                    sucess = addtolineup(teamArray, B2_Players, team, k, LockedTeams, lastPlayerSal, position);
                                }



                            }

                            if (sucess == null) {
                                // console.log("sucess second in SG",sucess);
                                sucess = randomplayer(teamArray, B2_Players, team, k, LockedTeams, lastPlayerSal, position);
                            }
                            // console.log("sucess",sucess);

                        }

                        if (position === "3B") {
                            B3_Players = B3_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                .includes(JSON.stringify(elm)));

                            B3_Players = B3_Players.sort((a, b) => {
                                return (b.FandDualProjection - a.FandDualProjection);
                            });

                            let teamSalary = team.reduce((acc, item) => {
                                // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                return acc + item.FanDuelSalary;
                            }, 0);

                            let remainingplayer = positions.length - k;
                            // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                            let lastPlayerSal = (Math.abs(35000 - teamSalary) / remainingplayer);

                            // console.log("last player sal In 3B: ", lastPlayerSal);

                            let length = lockedPlayers.length;
                            let sucess = 0;
                            for (let i = 0; i < length;) {
                                if (B3_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                    // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                                    let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                    if (j != 0) {
                                        playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                        if (!playerCount) {
                                            newcount = 0;
                                        } else {
                                            newcount = playerCount.count;
                                        }
                                        // console.log("Count",playerCount);
                                        // console.log("onlyCount", newcount);
                                        if (newcount < playerexpo) {
                                            // console.log("enter");
                                            sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                            i = length;
                                            continue;
                                        } else {
                                            // console.log("not enter");
                                            // sucess =  addtolineup(teamArray, SG_Players, team, k, LockedTeams, position);
                                            // i = length;
                                            i++;
                                            continue;

                                        }

                                    } else {
                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                        i = length;
                                        continue;
                                    }

                                }
                                else {
                                    // console.log("no");
                                    i++;
                                }
                            }

                            // console.log("sucess1",sucess);

                            if (sucess == 0) {
                                // console.log("SG_sucessPlayers");
                                if (lastPlayerSal > 4500) {
                                    sucess = lastPlayer(teamArray, B3_Players, team, k, LockedTeams, lastPlayerSal, position);
                                }
                                else if (lastPlayerSal < 3000) {
                                    sucess = takelowplayer(teamArray, B3_Players, team, k, LockedTeams, lastPlayerSal, position);
                                }
                                else {
                                    sucess = addtolineup(teamArray, B3_Players, team, k, LockedTeams, lastPlayerSal, position);
                                }

                            }

                            if (sucess == null) {
                                // console.log("sucess second in SG",sucess);
                                sucess = randomplayer(teamArray, B3_Players, team, k, LockedTeams, lastPlayerSal, position);
                            }

                            // console.log("sucess",sucess);

                        }

                        if (position === "SS") {
                            SS_Players = SS_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                .includes(JSON.stringify(elm)));


                            SS_Players = SS_Players.sort((a, b) => {
                                return (b.FandDualProjection - a.FandDualProjection);
                            });

                            let teamSalary = team.reduce((acc, item) => {
                                return acc + item.FanDuelSalary;
                            }, 0);

                            let remainingplayer = positions.length - k;
                            // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                            let lastPlayerSal = (Math.abs(35000 - teamSalary) / remainingplayer);
                            // console.log("last player sal In SS: ", lastPlayerSal);

                            let length = lockedPlayers.length;
                            let sucess = 0;
                            let playerCount = {};
                            for (let i = 0; i < length;) {
                                if (SS_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                    // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                                    let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                    if (j != 0) {
                                        playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                        if (!playerCount) {
                                            newcount = 0;
                                        } else {
                                            newcount = playerCount.count;
                                        }
                                        // console.log("Count",playerCount);
                                        // console.log("onlyCount", newcount);
                                        if (newcount < playerexpo) {
                                            // console.log("enter");
                                            sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                            i = length;
                                            continue;
                                        } else {
                                            // console.log("not enter");
                                            // sucess =  firstPLayer(teamArray, PG_Players, team, k, LockedTeams, position);
                                            // i = length;
                                            i++;
                                            continue;

                                        }

                                    } else {
                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                        i = length;
                                        continue;
                                    }


                                }
                                else {
                                    // console.log("no");
                                    i++;
                                }
                            }

                            // console.log("sucess1",sucess);

                            if (sucess == 0) {
                                // console.log("PG_sucessPlayers");

                                if (lastPlayerSal > 4500) {
                                    sucess = lastPlayer(teamArray, SS_Players, team, k, LockedTeams, lastPlayerSal, position);
                                } else if (lastPlayerSal < 3000) {
                                    sucess = takelowplayer(teamArray, SS_Players, team, k, LockedTeams, lastPlayerSal, position);
                                }
                                else {
                                    sucess = addtolineup(teamArray, SS_Players, team, k, LockedTeams, lastPlayerSal, position);
                                }
                            }



                            if (sucess == null) {
                                // console.log("sucess second in SG",sucess);
                                sucess = randomplayer(teamArray, SS_Players, team, k, LockedTeams, lastPlayerSal, position);
                            }

                            // console.log("sucess",sucess);

                        }

                        if (position === "OF") {
                            OF_Players = OF_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                .includes(JSON.stringify(elm)));


                            OF_Players = OF_Players.sort((a, b) => {
                                return (b.FandDualProjection - a.FandDualProjection);
                            });

                            let teamSalary = team.reduce((acc, item) => {
                                return acc + item.FanDuelSalary;
                            }, 0);

                            let remainingplayer = positions.length - k;
                            // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                            let lastPlayerSal = (Math.abs(35000 - teamSalary) / remainingplayer);
                            // console.log("last player sal In OF: ", lastPlayerSal);

                            let length = lockedPlayers.length;
                            let sucess = 0;
                            let playerCount = {};
                            for (let i = 0; i < length;) {
                                if (OF_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                    // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                                    let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                    if (j != 0) {
                                        playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                        if (!playerCount) {
                                            newcount = 0;
                                        } else {
                                            newcount = playerCount.count;
                                        }
                                        // console.log("Count",playerCount);
                                        // console.log("onlyCount", newcount);
                                        if (newcount < playerexpo) {
                                            // console.log("enter");
                                            sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                            i = length;
                                            continue;
                                        } else {
                                            // console.log("not enter");
                                            // sucess =  firstPLayer(teamArray, PG_Players, team, k, LockedTeams, position);
                                            // i = length;
                                            i++;
                                            continue;

                                        }

                                    } else {
                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                        i = length;
                                        continue;
                                    }


                                }
                                else {
                                    // console.log("no");
                                    i++;
                                }
                            }

                            // console.log("sucess1",sucess);

                            if (sucess == 0) {
                                // console.log("PG_sucessPlayers");

                                if (lastPlayerSal > 4500) {
                                    sucess = lastPlayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                } else if (lastPlayerSal < 3000) {
                                    sucess = takelowplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                }
                                else {
                                    sucess = addtolineup(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                }
                            }



                            if (sucess == null) {
                                // console.log("sucess second in SG",sucess);
                                sucess = randomplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                            }

                            // console.log("sucess",sucess);

                        }

                        if (position === "OF2") {
                            OF_Players = OF_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                .includes(JSON.stringify(elm)));


                            OF_Players = OF_Players.sort((a, b) => {
                                return (b.FandDualProjection - a.FandDualProjection);
                            });

                            let teamSalary = team.reduce((acc, item) => {
                                return acc + item.FanDuelSalary;
                            }, 0);

                            let remainingplayer = positions.length - k;
                            // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                            let lastPlayerSal = (Math.abs(35000 - teamSalary) / remainingplayer);
                            // console.log("last player sal In OF2: ", lastPlayerSal);

                            let length = lockedPlayers.length;
                            let sucess = 0;
                            let playerCount = {};
                            for (let i = 0; i < length;) {
                                if (OF_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                    // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                                    let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                    if (j != 0) {
                                        playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                        if (!playerCount) {
                                            newcount = 0;
                                        } else {
                                            newcount = playerCount.count;
                                        }
                                        // console.log("Count",playerCount);
                                        // console.log("onlyCount", newcount);
                                        if (newcount < playerexpo) {
                                            // console.log("enter");
                                            sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                            i = length;
                                            continue;
                                        } else {
                                            // console.log("not enter");
                                            // sucess =  firstPLayer(teamArray, PG_Players, team, k, LockedTeams, position);
                                            // i = length;
                                            i++;
                                            continue;

                                        }

                                    } else {
                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                        i = length;
                                        continue;
                                    }


                                }
                                else {
                                    // console.log("no");
                                    i++;
                                }
                            }

                            // console.log("sucess1",sucess);

                            if (sucess == 0) {
                                // console.log("PG_sucessPlayers");

                                if (lastPlayerSal > 4000) {
                                    sucess = lastPlayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                }
                                else if (lastPlayerSal < 3000) {
                                    sucess = takelowplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                }
                                else {
                                    sucess = addtolineup(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                }
                            }



                            if (sucess == null) {
                                // console.log("sucess second in SG",sucess);
                                sucess = randomplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                            }

                            // console.log("sucess",sucess);

                        }

                        if (position === "OF3") {
                            OF_Players = OF_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                .includes(JSON.stringify(elm)));


                            OF_Players = OF_Players.sort((a, b) => {
                                return (b.FandDualProjection - a.FandDualProjection);
                            });

                            let teamSalary = team.reduce((acc, item) => {
                                return acc + item.FanDuelSalary;
                            }, 0);

                            let remainingplayer = positions.length - k;
                            // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                            let lastPlayerSal = (Math.abs(35000 - teamSalary) / remainingplayer);
                            // console.log("last player sal In OF3: ", lastPlayerSal);

                            let length = lockedPlayers.length;
                            let sucess = 0;
                            let playerCount = {};
                            for (let i = 0; i < length;) {
                                if (OF_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                    // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                                    let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                    if (j != 0) {
                                        playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                        if (!playerCount) {
                                            newcount = 0;
                                        } else {
                                            newcount = playerCount.count;
                                        }
                                        // console.log("Count",playerCount);
                                        // console.log("onlyCount", newcount);
                                        if (newcount < playerexpo) {
                                            // console.log("enter");
                                            sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                            i = length;
                                            continue;
                                        } else {
                                            // console.log("not enter");
                                            // sucess =  firstPLayer(teamArray, PG_Players, team, k, LockedTeams, position);
                                            // i = length;
                                            i++;
                                            continue;

                                        }

                                    } else {
                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                        i = length;
                                        continue;
                                    }


                                }
                                else {
                                    // console.log("no");
                                    i++;
                                }
                            }

                            // console.log("sucess1",sucess);

                            if (sucess == 0) {
                                // console.log("PG_sucessPlayers");
                                if (lastPlayerSal > 4000) {
                                    sucess = lastPlayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                }
                                else if (lastPlayerSal < 3000) {
                                    sucess = takelowplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                }
                                else {
                                    sucess = addtolineup(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                                }
                            }



                            if (sucess == null) {
                                // console.log("sucess second in SG",sucess);
                                sucess = randomplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                            }

                            // console.log("sucess",sucess);

                        }

                        if (position === "UTIL") {
                            UTIL_Players = UTIL_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                .includes(JSON.stringify(elm)));


                            UTIL_Players = UTIL_Players.sort((a, b) => {
                                return (b.FandDualProjection - a.FandDualProjection);
                            });

                            let teamSalary = team.reduce((acc, item) => {
                                return acc + item.FanDuelSalary;
                            }, 0);

                            let remainingplayer = positions.length - k;
                            // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                            let lastPlayerSal = (Math.abs(35000 - teamSalary) / remainingplayer);
                            // console.log("last player sal In UTIL: ", lastPlayerSal);

                            let length = lockedPlayers.length;
                            let sucess = 0;
                            let playerCount = {};
                            for (let i = 0; i < length;) {
                                if (UTIL_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                    // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                                    let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                    if (j != 0) {
                                        playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                        if (!playerCount) {
                                            newcount = 0;
                                        } else {
                                            newcount = playerCount.count;
                                        }
                                        // console.log("Count",playerCount);
                                        // console.log("onlyCount", newcount);
                                        if (newcount < playerexpo) {
                                            // console.log("enter");
                                            sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                            i = length;
                                            continue;
                                        } else {
                                            // console.log("not enter");
                                            // sucess =  firstPLayer(teamArray, PG_Players, team, k, LockedTeams, position);
                                            // i = length;
                                            i++;
                                            continue;

                                        }

                                    } else {
                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                        i = length;
                                        continue;
                                    }


                                }
                                else {
                                    // console.log("no");
                                    i++;
                                }
                            }

                            // console.log("sucess1",sucess);

                            if (sucess == 0) {
                                // console.log("PG_sucessPlayers");

                                // if (lastPlayerSal > 2500) {
                                sucess = lastPlayerutil(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                                // }
                                // else {
                                //     sucess = addtolineup(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                                // }
                            }



                            if (sucess == null) {
                                // console.log("sucess second in SG",sucess);
                                sucess = randomplayer(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                            }

                            // console.log("sucess",sucess);

                        }

                    }

                    function includelockPLayer(teamArr, playerArr, team, k, position) {


                        if (teamArr.filter(el => el.TeamID == playerArr.TeamID).length == 0) {
                            // console.log("Before update: 3");
                            teamArr.push({ PlayerId: playerArr.PlayerID });
                            teamArr.push({ TeamID: playerArr.TeamID, teamCount });
                        }
                        else {
                            // console.log("Before update: 4");
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr.TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                // console.log("Before update: 5");
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: playerArr.PlayerID });
                            }
                            else {
                                // console.log("Before update: 6");
                                return 0;
                            }
                        }

                        if (complete.filter(el => el.id == playerArr.PlayerID).length == 0) {
                            // console.log("Before update: 1");
                            count = 1;
                            let playerDataWithCount = {
                                id: playerArr.PlayerID,
                                TeamID: playerArr.TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {

                            // console.log("Before update: 2");
                            let objIndex = complete.findIndex((obj => obj.id == playerArr.PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }

                        team[k] = playerArr;
                        return 1;
                    }

                    function firstPLayerpitcher(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position) {

                        // console.log("lockedTeams: ", LockedTeams);
                        // console.log("PlayerArray: ", teamArr); 
                        let playerlength = 0;
                        let playerArr = [];

                        if (LockedTeams) {
                            // array exists and is not empty
                            // console.log("lockedTeams: Last ", LockedTeams['9']);

                            for (const [key, value] of Object.entries(LockedTeams)) {
                                // console.log(key , value);
                                let array1 = AllplayerArr.filter(obj => {

                                    // console.log("array :1 ", obj.TeamID); 
                                    return obj.TeamID == key
                                });
                                array1 = Object.assign(array1);
                                playerArr = playerArr.concat(array1);
                                // playerArr.push(array1);
                            }
                        }

                        playerArr = AllplayerArr.filter(elm => !playerArr.map(elm => JSON.stringify(elm))
                            .includes(JSON.stringify(elm)));


                        if (playerArr.length > 10) {
                            playerlength = 9;
                        } else {
                            playerlength = playerArr.length - 1;
                        }

                        let length = playerArr.length + 30;

                        for (let i = 0; i < length;) {
                            let n = Math.floor(Math.random() * Math.floor(playerlength));
                            // console.log("teamId 111: ", playerArr[n].FanDuelSalary);

                            let needvalue = 1.5;

                            if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                                && playerArr[n].FandDualProjection >= 3 && playerArr[n].FanDualVal >= needvalue) {

                                if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                    teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                }
                                else {
                                    let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                    if (teamArr[objIndex].teamCount < 4) {
                                        teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                        teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                    }
                                    else {
                                        i++;
                                        continue;
                                    }
                                }

                                if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                    count = 1;
                                    let playerDataWithCount = {
                                        id: playerArr[n].PlayerID,
                                        TeamID: playerArr[n].TeamID,
                                        count: count
                                    }
                                    complete.push(playerDataWithCount);
                                }
                                else {
                                    let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                    // console.log("Before update: ", complete[objIndex]);
                                    complete[objIndex].count = complete[objIndex].count + 1;
                                }

                                salary = salary - playerArr[n].FanDuelSalary;
                                team[k] = playerArr[n];
                                i = length;
                                // console.log("in compare team: ", team);
                                return 1;
                            }
                            else {
                                i++;
                            }
                        }

                    }

                    function firstPLayer(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position) {

                        // console.log("lockedTeams: ", LockedTeams);
                        // console.log("PlayerArray: ", teamArr); 
                        let playerArr = [];
                        let playerlength = 0;
                        let teamfilter = 0;

                        if (LockedTeams) {
                            // array exists and is not empty
                            // console.log("lockedTeams: Last ", LockedTeams['9']);

                            for (const [key, value] of Object.entries(LockedTeams)) {
                                // console.log(key , value);
                                if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                                    // console.log("yes:",);
                                    let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                                    // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                                    if (value > teamArr[objIndex].teamCount) {
                                        // console.log("Teamid",key); 
                                        // filter lock teams
                                        let array1 = AllplayerArr.filter(obj => {

                                            // console.log("array :1 ", obj.TeamID); 
                                            return obj.TeamID == key
                                        });
                                        array1 = Object.assign(array1);
                                        playerArr = playerArr.concat(array1);
                                        // playerArr.push(array1);
                                    }
                                } else {
                                    // console.log("Teamid",key); 
                                    let array1 = AllplayerArr.filter(obj => {

                                        // console.log("array :1 ", obj.TeamID); 
                                        return obj.TeamID == key
                                    });
                                    array1 = Object.assign(array1);
                                    playerArr = playerArr.concat(array1);
                                    // playerArr.push(array1);

                                }

                            }
                        }


                        // console.log("arrayfinal ", playerArr.length);

                        playerArr = playerArr.filter(item => item.FandDualProjection != 0);

                        if (playerArr.length == 0) {
                            playerArr = AllplayerArr;
                            teamfilter = 1;
                            playerlength = 4;

                        } else {

                            playerlength = playerArr.length;
                        }

                        // console.log("arrayfinal ", playerArr.length);

                        let addlastPlayerSal = lastPlayerSal - 500;

                        let length = playerArr.length;

                        if (teamfilter === 1) {
                            for (let i = 0; i < length;) {
                                let n = Math.floor(Math.random() * Math.floor(playerlength));
                                // console.log("teamId 111: ", playerArr[n].FanDuelSalary);

                                let needvalue = 1.5;

                                if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                                    && addlastPlayerSal >= playerArr[n].FanDuelSalary
                                    && playerArr[n].FandDualProjection >= 3 && playerArr[n].FanDualVal >= needvalue) {

                                    if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                        teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                        teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                    }
                                    else {
                                        let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                        if (teamArr[objIndex].teamCount < 4) {
                                            teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                            teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                        }
                                        else {
                                            i++;
                                            continue;
                                        }
                                    }

                                    if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                        count = 1;
                                        let playerDataWithCount = {
                                            id: playerArr[n].PlayerID,
                                            TeamID: playerArr[n].TeamID,
                                            count: count
                                        }
                                        complete.push(playerDataWithCount);
                                    }
                                    else {
                                        let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                        // console.log("Before update: ", complete[objIndex]);
                                        complete[objIndex].count = complete[objIndex].count + 1;
                                    }

                                    salary = salary - playerArr[n].FanDuelSalary;
                                    team[k] = playerArr[n];
                                    i = length;
                                    // console.log("in compare team: ", team);
                                    return 1;
                                }
                                else {
                                    i++;
                                }
                            }

                        } else {

                            length = length + 30;
                            for (let i = 0; i < length;) {
                                let n = Math.floor(Math.random() * Math.floor(playerlength));
                                // console.log("teamId: ", playerArr[n].TeamID,playerArr[n].DraftKingsProjection,playerArr[n].DraftKingsVal);
                                let needvalue = 1;
                                // console.log("teamId 222: ", playerArr[n].FanDuelSalary,playerArr[n].FandDualProjection,playerArr[n].FanDualVal);
                                if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0 && playerArr[n].FandDualProjection >= 3 && playerArr[n].FanDualVal >= needvalue) {

                                    if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                        teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                        teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                    }
                                    else {
                                        let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                        if (teamArr[objIndex].teamCount < 4) {
                                            teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                            teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                        }
                                        else {
                                            i++;
                                            continue;
                                        }
                                    }

                                    if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                        count = 1;
                                        let playerDataWithCount = {
                                            id: playerArr[n].PlayerID,
                                            TeamID: playerArr[n].TeamID,
                                            count: count
                                        }
                                        complete.push(playerDataWithCount);
                                    }
                                    else {
                                        let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                        // console.log("Before update: ", complete[objIndex]);
                                        complete[objIndex].count = complete[objIndex].count + 1;
                                    }

                                    salary = salary - playerArr[n].FanDuelSalary;
                                    team[k] = playerArr[n];
                                    i = length;
                                    // console.log("in compare team: ", team);
                                    return 1;
                                }
                                else {
                                    i++;
                                }
                            }

                        }
                    }

                    function takelowplayer(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position) {

                        // console.log("low player ");

                        let playerArr = [];
                        let addlastPlayerSal = 0;
                        let playerlength = 0;
                        let teamfilter = 0;

                        // if (LockedTeams) {
                        //     // array exists and is not empty
                        //     // console.log("lockedTeams: Last ", LockedTeams['9']);

                        //     for (const [key, value] of Object.entries(LockedTeams)) {
                        //         // console.log(key , value);
                        //         // console.log("teamArr.length: ", teamArr.length); 
                        //         // console.log("teamArr.filter(el => el.TeamID == key).length: ", teamArr.filter(el => el.TeamID == key).length); 
                        //         if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                        //             // console.log("yes:1",);
                        //             let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                        //             // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                        //             if (value > teamArr[objIndex].teamCount) {
                        //                 // console.log("Teenter",key); 
                        //                 // filter lock teams
                        //                 let array1 = AllplayerArr.filter(obj => {

                        //                     // console.log("array :1 ", obj.TeamID); 
                        //                     return obj.TeamID == key
                        //                 });

                        //                 array1 = Object.assign(array1);
                        //                 playerArr = playerArr.concat(array1);
                        //                 // playerArr.push(array1);
                        //             }
                        //         } else {
                        //             // console.log("yes:2",);
                        //             // console.log("Teamid",key); 
                        //             let array1 = AllplayerArr.filter(obj => {

                        //                 // console.log("array :1 ", obj.TeamID); 
                        //                 return obj.TeamID == key
                        //             });
                        //             array1 = Object.assign(array1);
                        //             playerArr = playerArr.concat(array1);
                        //             // playerArr.push(array1);

                        //         }

                        //     }
                        // }

                        // console.log("add arrayfinal before", playerArr.length);
                        // playerArr = playerArr.filter(item => item.DraftKingsProjection != 0);
                        // playerArr = playerArr.filter(item => item.DraftKingsSalary <= 5000);

                        if (playerArr.length == 0) {
                            playerArr = AllplayerArr;
                            addlastPlayerSal = 3500;
                            playerArr = playerArr.filter(item => item.FanDuelSalary <= addlastPlayerSal);
                            playerArr = playerArr.sort((a, b) => {
                                return (b.FandDualProjection - a.FandDualProjection)
                            })
                            if (playerArr.length > 15) {
                                playerlength = 14;
                            } else {
                                playerlength = playerArr.length - 1;
                            }
                            teamfilter = 1;

                        } else {

                            addlastPlayerSal = 3500;
                            playerArr = playerArr.filter(item => item.FanDuelSalary <= addlastPlayerSal);
                            playerArr = playerArr.sort((a, b) => {
                                return (b.FandDualProjection - a.FandDualProjection)
                            })
                            playerlength = playerArr.length - 1;
                        }

                        // console.log("add arrayfinal ", playerArr.length);

                        playerArr = playerArr.filter(item => item.DraftKingsSalary <= 4500);


                        let length = playerArr.length + 40;
                        // console.log("length ", length);
                        if (teamfilter === 1) {
                            for (let i = 0; i < length;) {
                                let n = Math.floor(Math.random() * Math.floor(playerlength));
                                let needvalue = 1;

                                // console.log("teamId: ", playerArr[n].TeamID);
                                // console.log("position: ", n);
                                // console.log("playerArr[n]: ", playerArr[n].DraftKingsProjection,i,n,playerArr[n].DraftKingsVal,playerArr[n].DraftKingsSalary);
                                if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                                    && addlastPlayerSal >= playerArr[n].DraftKingsSalary
                                    && playerArr[n].DraftKingsProjection >= 5 && playerArr[n].DraftKingsVal >= needvalue) {
                                    // console.log("position: enter3 ");
                                    if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                        // console.log("position: 3 ");
                                        teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                        teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                    }
                                    else {
                                        let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                        if (teamArr[objIndex].teamCount < 4) {
                                            // console.log("position: 4 ");
                                            teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                            teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                        }
                                        else {
                                            // console.log("position: 5 ");
                                            i++;
                                            continue;
                                        }
                                    }

                                    if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                        // console.log("position: 1 ");
                                        count = 1;
                                        let playerDataWithCount = {
                                            id: playerArr[n].PlayerID,
                                            TeamID: playerArr[n].TeamID,
                                            count: count
                                        }
                                        complete.push(playerDataWithCount);
                                    }
                                    else {
                                        // console.log("position: 2 ");
                                        let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                        // console.log("Before update: ", complete[objIndex]);
                                        complete[objIndex].count = complete[objIndex].count + 1;
                                    }


                                    // salary = salary - playerArr[n].DraftKingsSalary;
                                    team[k] = playerArr[n];
                                    i = length;
                                    // console.log("in compare team: ", team);
                                    return 1;
                                }
                                else {
                                    i++;
                                }
                            }
                        } else {

                            playerArr = playerArr.sort((a, b) => {
                                return (b.DraftKingsProjection - a.DraftKingsProjection);
                            });

                            // length = length + 30;
                            for (let i = 0; i < playerArr.length;) {
                                let n = i;
                                let needvalue = 1;

                                // console.log("teamId: ", playerArr[n].TeamID);
                                // console.log("position: ", n);
                                // console.log("DraftKingsProjection: ", playerArr[n].DraftKingsProjection,i,n,playerArr[n].DraftKingsVal);
                                if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                                    && playerArr[n].DraftKingsProjection >= 5 && playerArr[n].DraftKingsVal >= needvalue) {
                                    // console.log("position: enter3 ");
                                    if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                        // console.log("position: 3 ");
                                        teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                        teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                    }
                                    else {
                                        let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                        if (teamArr[objIndex].teamCount < 4) {
                                            // console.log("position: 4 ");
                                            teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                            teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                        }
                                        else {
                                            // console.log("position: 5 ");
                                            i++;
                                            continue;
                                        }
                                    }

                                    if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                        // console.log("position: 1 ");
                                        count = 1;
                                        let playerDataWithCount = {
                                            id: playerArr[n].PlayerID,
                                            TeamID: playerArr[n].TeamID,
                                            count: count
                                        }
                                        complete.push(playerDataWithCount);
                                    }
                                    else {
                                        // console.log("position: 2 ");
                                        let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                        // console.log("Before update: ", complete[objIndex]);
                                        complete[objIndex].count = complete[objIndex].count + 1;
                                    }


                                    // salary = salary - playerArr[n].DraftKingsSalary;
                                    team[k] = playerArr[n];
                                    i = length;
                                    // console.log("in compare team: ", team);
                                    return 1;
                                }
                                else {
                                    i++;
                                }
                            }
                        }
                    }

                    function addtolineup(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position) {

                        // console.log("lockedTeams: add to line up", LockedTeams);
                        // console.log("PlayerArray: ", teamArr); 
                        // console.log("Add to line up: ");

                        let playerArr = [];
                        let playerlength = 0;
                        let teamfilter = 0;

                        // if (LockedTeams) {
                        //     // array exists and is not empty
                        //     // console.log("lockedTeams: Last ", LockedTeams['9']);

                        //     for (const [key, value] of Object.entries(LockedTeams)) {
                        //         // console.log(key , value);
                        //         // console.log("teamArr.length: ", teamArr.length); 
                        //         // console.log("teamArr.filter(el => el.TeamID == key).length: ", teamArr.filter(el => el.TeamID == key).length); 
                        //         if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                        //             // console.log("yes:1",);
                        //             let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                        //             // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                        //             if (value > teamArr[objIndex].teamCount) {
                        //                 // console.log("Teenter",key); 
                        //                 // filter lock teams
                        //                 let array1 = AllplayerArr.filter(obj => {

                        //                     // console.log("array :1 ", obj.TeamID); 
                        //                     return obj.TeamID == key
                        //                 });

                        //                 array1 = Object.assign(array1);
                        //                 playerArr = playerArr.concat(array1);
                        //                 // playerArr.push(array1);
                        //             }
                        //         } else {
                        //             // console.log("yes:2",);
                        //             // console.log("Teamid",key); 
                        //             let array1 = AllplayerArr.filter(obj => {

                        //                 // console.log("array :1 ", obj.TeamID); 
                        //                 return obj.TeamID == key
                        //             });
                        //             array1 = Object.assign(array1);
                        //             playerArr = playerArr.concat(array1);
                        //             // playerArr.push(array1);

                        //         }

                        //     }
                        // }

                        // console.log("arrayfinal before", playerArr.length);
                        // playerArr = playerArr.filter(item => item.FandDualProjection != 0);

                        if (playerArr.length == 0) {
                            playerArr = AllplayerArr;
                            playerArr = playerArr.filter(item => item.FandDualProjection != 0);
                            playerArr = playerArr.sort((a, b) => {
                                return (b.FandDualProjection - a.FandDualProjection)
                            })
                            teamfilter = 1;
                            if (playerArr.length > 16) {
                                playerlength = 15;
                            } else {
                                playerlength = playerArr.length - 1;
                            }

                        } else {

                            playerArr = playerArr.filter(item => item.FandDualProjection != 0);
                            playerArr = playerArr.sort((a, b) => {
                                return (b.FandDualProjection - a.FandDualProjection)
                            })
                            playerlength = playerArr.length - 1;
                        }

                        // console.log("arrayfinal ", playerArr.length);

                        let addlastPlayerSal = lastPlayerSal;

                        // console.log("addlastPlayerSal ", addlastPlayerSal);

                        let length = playerArr.length + 30;
                        if (teamfilter === 1) {
                            for (let i = 0; i < length;) {
                                let n = Math.floor(Math.random() * Math.floor(playerlength));
                                // console.log("teamId: ", playerArr[n].TeamID);
                                // console.log("position: ", n);
                                // console.log("add to line up salary 11: ", playerArr[n].FanDuelSalary,playerArr[n].FandDualProjection,playerArr[n].FanDualVal);
                                let needvalue = 1.5;
                                if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                                    && playerArr[n].FandDualProjection >= 3 && playerArr[n].FanDualVal >= needvalue) {
                                    // console.log("position: enter3 ");
                                    if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                        // console.log("position: 3 ");
                                        teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                        teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                    }
                                    else {
                                        let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                        if (teamArr[objIndex].teamCount < 4) {
                                            // console.log("position: 4 ");
                                            teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                            teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                        }
                                        else {
                                            // console.log("position: 5 ");
                                            i++;
                                            continue;
                                        }
                                    }

                                    if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                        // console.log("position: 1 ");
                                        count = 1;
                                        let playerDataWithCount = {
                                            id: playerArr[n].PlayerID,
                                            TeamID: playerArr[n].TeamID,
                                            count: count
                                        }
                                        complete.push(playerDataWithCount);
                                    }
                                    else {
                                        // console.log("position: 2 ");
                                        let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                        // console.log("Before update: ", complete[objIndex]);
                                        complete[objIndex].count = complete[objIndex].count + 1;
                                    }


                                    // salary = salary - playerArr[n].DraftKingsSalary;
                                    team[k] = playerArr[n];
                                    i = length;
                                    // console.log("in compare team: ", team);
                                    return 1;
                                }
                                else {
                                    i++;
                                }
                            }
                        } else {

                            playerArr = playerArr.sort((a, b) => {
                                return (b.FandDualProjection - a.FandDualProjection);
                            });

                            length = length + 30;
                            for (let i = 0; i < length;) {
                                // let n = Math.floor(Math.random() * Math.floor(playerlength));
                                let n = i;
                                // console.log("teamId: ", playerArr[n].TeamID,playerArr[n].DraftKingsProjection,playerArr[n].DraftKingsVal);
                                let needvalue = 1;
                                // console.log("add to line up salary 22: ", playerArr[n].FanDuelSalary);
                                if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                                    && playerArr[n].FandDualProjection >= 3 && playerArr[n].FanDualVal >= needvalue) {
                                    // console.log("position: enter3 ");
                                    if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                        // console.log("position: 3 ");
                                        teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                        teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                    }
                                    else {
                                        let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                        if (teamArr[objIndex].teamCount < 4) {
                                            // console.log("position: 4 ");
                                            teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                            teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                        }
                                        else {
                                            // console.log("position: 5 ");
                                            i++;
                                            continue;
                                        }
                                    }

                                    if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                        // console.log("position: 1 ");
                                        count = 1;
                                        let playerDataWithCount = {
                                            id: playerArr[n].PlayerID,
                                            TeamID: playerArr[n].TeamID,
                                            count: count
                                        }
                                        complete.push(playerDataWithCount);
                                    }
                                    else {
                                        // console.log("position: 2 ");
                                        let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                        // console.log("Before update: ", complete[objIndex]);
                                        complete[objIndex].count = complete[objIndex].count + 1;
                                    }


                                    // salary = salary - playerArr[n].DraftKingsSalary;
                                    team[k] = playerArr[n];
                                    i = length;
                                    // console.log("in compare team: ", team);
                                    return 1;
                                }
                                else {
                                    i++;
                                }
                            }
                        }
                    }

                    function randomplayer(teamArr, playerArr, team, k, LockedTeams, lastPlayerSal, position) {

                        // console.log("Random: ");
                        let addlastPlayerSal = 2000;

                        resultA = playerArr.sort((a, b) => {
                            return (b.FandDualProjection - a.FandDualProjection)
                        })

                        let length = playerArr.length + 30;
                        for (let i = 0; i < length;) {
                            let playerlength = 9;
                            let n = Math.floor(Math.random() * Math.floor(playerlength));
                            let needvalue = 1;
                            // console.log("teamId: ", playerArr[n].TeamID);
                            // console.log("position: ", n);
                            // console.log("random salary: ", playerArr[n].FanDuelSalary,playerArr[n].FandDualProjection);
                            if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                                && playerArr[n].FandDualProjection >= 3 && playerArr[n].FanDualVal >= needvalue) {
                                // console.log("position: enter3 ");
                                if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                    // console.log("position: 3 ");
                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                    teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                }
                                else {
                                    let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                    if (teamArr[objIndex].teamCount < 4) {
                                        // console.log("position: 4 ");
                                        teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                        teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                    }
                                    else {
                                        // console.log("position: 5 ");  
                                        i++;
                                        continue;
                                    }
                                }

                                if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                    // console.log("position: 1 ");
                                    count = 1;
                                    let playerDataWithCount = {
                                        id: playerArr[n].PlayerID,
                                        TeamID: playerArr[n].TeamID,
                                        count: count
                                    }
                                    complete.push(playerDataWithCount);
                                }
                                else {
                                    // console.log("position: 2 ");
                                    let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                    // console.log("Before update: ", complete[objIndex]);
                                    complete[objIndex].count = complete[objIndex].count + 1;
                                }


                                // salary = salary - playerArr[n].DraftKingsSalary;
                                team[k] = playerArr[n];
                                i = length;
                                // console.log("in compare team: ", team);
                                return 1;
                            }
                            else {
                                i++;
                            }
                        }
                    }

                    function lastPlayer(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position) {


                        // console.log("last player: ");

                        let playerArr = [];
                        let playerlength = 0;

                        if (LockedTeams) {
                            // array exists and is not empty
                            // console.log("lockedTeams: Last ", LockedTeams['9']);

                            for (const [key, value] of Object.entries(LockedTeams)) {
                                // console.log(key , value);
                                // console.log("teamArr.length: ", teamArr.length); 
                                // console.log("teamArr.filter(el => el.TeamID == key).length: ", teamArr.filter(el => el.TeamID == key).length); 
                                if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                                    // console.log("yes:1",);
                                    let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                                    // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                                    if (value > teamArr[objIndex].teamCount) {
                                        // console.log("Teenter",key); 
                                        // filter lock teams
                                        let array1 = AllplayerArr.filter(obj => {

                                            // console.log("array :1 ", obj.TeamID); 
                                            return obj.TeamID == key
                                        });

                                        array1 = Object.assign(array1);
                                        playerArr = playerArr.concat(array1);
                                        // playerArr.push(array1);
                                    }
                                } else {
                                    // console.log("yes:2",);
                                    // console.log("Teamid",key); 
                                    let array1 = AllplayerArr.filter(obj => {

                                        // console.log("array :1 ", obj.TeamID); 
                                        return obj.TeamID == key
                                    });
                                    array1 = Object.assign(array1);
                                    playerArr = playerArr.concat(array1);
                                    // playerArr.push(array1);

                                }

                            }
                        }

                        // console.log("add arrayfinal before", playerArr.length);


                        if (playerArr.length == 0) {
                            playerArr = AllplayerArr;
                            addlastPlayerSal = lastPlayerSal;
                            if (playerArr.length > 15) {
                                playerlength = 14;
                            } else {
                                playerlength = playerArr.length;
                            }
                            teamfilter = 1;

                        } else {

                            addlastPlayerSal = 7000;

                            playerlength = playerArr.length - 1;
                        }

                        playerArr = playerArr.filter(item => item.FandDualProjection != 0);

                        // console.log("add arrayfinal ", playerArr.length);

                        resultA = playerArr.sort((a, b) => {
                            return (b.FanDuelSalary - a.FanDuelSalary) || (b.FandDualProjection - a.FandDualProjection)
                        })

                        // console.log("resultA: ",resultA);
                        let length = resultA.length + 30;
                        // console.log("resultA: ",teamCount);
                        for (let i = 0; i <= length;) {

                            let l = Math.floor(Math.random() * Math.floor(playerlength));
                            let needvalue = 1.5;
                            // console.log("teamId: ", resultA[l].TeamID);
                            // console.log("result inside l: ",l,resultA[l].FanDuelSalary,resultA[l].Name,resultA[l].FandDualProjection,resultA[l].FanDualVal);
                            // if (resultA[l].DepthChartOrder == '0') {
                            // console.log("last player result Sallary l: ",resultA[l].FanDuelSalary,resultA[l].Name,resultA[l].FanDualVal);

                            if (teamArr.filter(item => item.PlayerId == resultA[l].PlayerID).length == 0
                                && lastPlayerSal >= resultA[l].FanDuelSalary
                                && resultA[l].FandDualProjection >= 3 && resultA[l].FanDualVal >= needvalue) {

                                if (teamArr.filter(el => el.TeamID == resultA[l].TeamID).length == 0) {
                                    // console.log("resultA: 3");
                                    teamArr.push({ PlayerId: resultA[l].PlayerID });
                                    teamArr.push({ TeamID: resultA[l].TeamID, teamCount });
                                }
                                else {
                                    let objIndex = teamArr.findIndex((obj => obj.TeamID == resultA[l].TeamID));
                                    if (teamArr[objIndex].teamCount < 4) {
                                        // console.log("resultA: 4");
                                        teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                        teamArr.push({ PlayerId: resultA[l].PlayerID });
                                    }
                                    else {
                                        // console.log("resultA: 5");
                                        i++;
                                        continue;
                                    }
                                }

                                if (complete.filter(el => el.id == resultA[l].PlayerID).length == 0) {
                                    // console.log("resultA: 1");
                                    count = 1;
                                    let playerDataWithCount = {
                                        id: resultA[l].PlayerID,
                                        TeamID: resultA[l].TeamID,
                                        count: count
                                    }
                                    complete.push(playerDataWithCount);
                                }
                                else {
                                    // console.log("resultA: 2");
                                    let objIndex = complete.findIndex((obj => obj.id == resultA[l].PlayerID));
                                    // console.log("Before update: ", complete[objIndex]);
                                    complete[objIndex].count = complete[objIndex].count + 1;
                                }


                                // salary = salary - playerArr[l].DraftKingsSalary;
                                // console.log("teamArr: ",teamArr);
                                team[k] = resultA[l];
                                // console.log("in compare team: ", team);
                                i = length;

                                return 1;

                            }
                            else {
                                i++;
                                continue;
                            }
                            //}else{

                            //  l++;
                            // }
                        }
                    }

                    function lastPlayerutil(teamArr, playerArr, team, k, LockedTeams, lastPlayerSal, position) {


                        // let resultA = playerArr.filter(elm => !teamArr.map(elm => JSON.stringify(elm))
                        //     .includes(JSON.stringify(elm)));

                        // let resultPLayerA= playerArr.filter(function(cv){
                        //     return !teamArr.find(function(e){
                        //         return e.PlayerId == cv.PlayerID;
                        //     });
                        // });

                        playerArr = playerArr.filter(item => item.FanDuelSalary <= lastPlayerSal);

                        resultA = playerArr.sort((a, b) => {
                            return (b.FanDuelSalary - a.FanDuelSalary) || (b.FandDualProjection - a.FandDualProjection)
                        })

                        // console.log("resultA: ",resultA);
                        let length = resultA.length - 1;
                        // console.log("resultA: ",teamCount);
                        for (let i = 0; i <= length;) {
                            let playerlength = 20;
                            let l = i;
                            let needvalue = 1;
                            // console.log("teamId: ", resultA[l].TeamID);
                            // console.log("result inside l: ",l,resultA[l].FanDuelSalary,resultA[l].Name,resultA[l].FandDualProjection,resultA[l].FanDualVal);
                            // if (resultA[l].DepthChartOrder == '0') {
                            // console.log("last player result Sallary l: ",resultA[l].FanDuelSalary,resultA[l].Name,resultA[l].FanDualVal);

                            if (teamArr.filter(item => item.PlayerId == resultA[l].PlayerID).length == 0
                                && lastPlayerSal >= resultA[l].FanDuelSalary
                                && resultA[l].FandDualProjection >= 3 && resultA[l].FanDualVal >= needvalue) {

                                if (teamArr.filter(el => el.TeamID == resultA[l].TeamID).length == 0) {
                                    // console.log("resultA: 3");
                                    teamArr.push({ PlayerId: resultA[l].PlayerID });
                                    teamArr.push({ TeamID: resultA[l].TeamID, teamCount });
                                }
                                else {
                                    let objIndex = teamArr.findIndex((obj => obj.TeamID == resultA[l].TeamID));
                                    if (teamArr[objIndex].teamCount < 4) {
                                        // console.log("resultA: 4");
                                        teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                        teamArr.push({ PlayerId: resultA[l].PlayerID });
                                    }
                                    else {
                                        // console.log("resultA: 5");
                                        i++;
                                        continue;
                                    }
                                }

                                if (complete.filter(el => el.id == resultA[l].PlayerID).length == 0) {
                                    // console.log("resultA: 1");
                                    count = 1;
                                    let playerDataWithCount = {
                                        id: resultA[l].PlayerID,
                                        TeamID: resultA[l].TeamID,
                                        count: count
                                    }
                                    complete.push(playerDataWithCount);
                                }
                                else {
                                    // console.log("resultA: 2");
                                    let objIndex = complete.findIndex((obj => obj.id == resultA[l].PlayerID));
                                    // console.log("Before update: ", complete[objIndex]);
                                    complete[objIndex].count = complete[objIndex].count + 1;
                                }


                                // salary = salary - playerArr[l].DraftKingsSalary;
                                // console.log("teamArr: ",teamArr);
                                team[k] = resultA[l];
                                // console.log("in compare team: ", team);
                                i = length;

                                return 1;

                            }
                            else {
                                i++;
                                continue;
                            }
                            //}else{

                            //  l++;
                            // }
                        }
                    }

                    // console.log("team: ", team);

                    teamArray = [];

                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.FanDuelSalary;
                    }, 0);

                    // console.log("team salary", teamSalary);
                    // console.log("complete team dgsdgsdgfdshfsdddddddfdhgggggggdgdgsgsdgsdg", team.length);

                    let getbuild = l * 30;
                    if (j == getbuild) {
                        //    // console.log(getbuild,"team",j,complete_team,teamcreate,reqsalary);
                        if (complete_team > teamcreate) {
                            reqsalary = reqsalary;
                            teamcreate = complete_team;
                        } else {
                            reqsalary = reqsalary - 500;
                            teamcreate = complete_team;
                        }
                        l = l + 1;
                    }

                    if (teamSalary <= 35000 && teamSalary >= reqsalary) {
                        // console.log("aeraea team salary", teamSalary);
                        // let fanteam = team.reverse();
                        allTeams.push(team);

                        let stringArray = allTeams.map(JSON.stringify);
                        let uniqueStringArray = new Set(stringArray);
                        allTeams = Array.from(uniqueStringArray, JSON.parse);

                        complete_team = allTeams.length;

                        for (const [key, value] of Object.entries(exposurePlayer)) {
                            // console.log(key, value);
                            // console.log(complete);
                            let newplayerCount = complete.find(item => item.id === key);
                            // console.log(value,newplayerCount);
                            if (newplayerCount)
                                if (value === newplayerCount.count) {
                                    exposurePlayer[key] = 0;
                                    delete exposurePlayer[key];
                                }
                        }

                    } else {

                        for (const [key, value] of Object.entries(exposurePlayer)) {
                            // console.log(key, value);
                            exposurePlayer[key] = value + 1;
                        }
                        // console.log("Exposure players array: ", exposurePlayer);
                    }
                    // console.log("complete_team: ", complete_team);
                    // console.log("get_builds: ", get_builds);
                    if (complete_team == get_builds) {
                        j = no_of_builds + 1;
                    }
                }

                var totalteams = allTeams;



                allTeams = allTeams.slice(-req.NumberOfBuild);

                let salaryArray = [];
                let projArray = [];
                for (let i = 0; i < allTeams.length; i++) {
                    let teamSalary = 0;
                    let teamProjection = 0;
                    for (let j = 0; j < allTeams[i].length; j++) {
                        // console.log("salary: ", allTeams[i][j].DraftKingsSalary);
                        teamSalary = teamSalary + allTeams[i][j].FanDuelSalary;
                        teamProjection = teamProjection + allTeams[i][j].FandDualProjection;
                    }
                    // console.log("teamProjection",teamProjection);
                    salaryArray[i] = teamSalary;
                    var ProjectionArray = {};
                    Object.assign(ProjectionArray, { teamnumber: i, teamvalue: teamProjection });
                    projArray.push(ProjectionArray);
                }

                let stringArray = allTeams.map(JSON.stringify);
                let uniqueStringArray = new Set(stringArray);
                allTeams = Array.from(uniqueStringArray, JSON.parse);

                let arrangeTeams = [];
                // let positions = ["QB","WR1","WR2","RB1","RB2","WR3","TE","FLEX","DST"];

                for (let i = 0; i < allTeams.length; i++) {
                    let team = [];
                    for (let j = 0; j < allTeams[i].length; j++) {
                        //    // console.log("i",i,"j: ", j,"newPos",newPos[j]);
                        team[j] = allTeams[i][newPos[j]];
                    }
                    arrangeTeams.push(team);
                }

                // console.log("arrangeTeams",arrangeTeams);
                allTeams = arrangeTeams;

                projArray = projArray.sort((a, b) => b.teamvalue - a.teamvalue);

                let projectarrangeTeams = [];
                let projectposition = [];
                for (let i = 0; i < projArray.length; i++) {
                    projectposition.push(projArray[i].teamnumber);
                }

                // console.log("projectposition",projectposition);

                for (let i = 0; i < allTeams.length; i++) {
                    // console.log(projectposition[i]);
                    let newteam = allTeams[projectposition[i]];
                    projectarrangeTeams.push(newteam);
                }

                allTeams = projectarrangeTeams;

                var senddata = {
                    "status": 0,
                    "success": true,
                    "allTeams": allTeams,
                    "salaryArray": salaryArray,
                    "delay": 3000
                }

                const slatTeamData = {
                    Teams: totalteams,
                }
                await SlatPlayers.update({SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, slatTeamData, (error, doc) => {
                    if (error || !doc) {
                        console.log("mlb DB error : Slat data update error");
                    }
                    else {
                        console.log("mlb Teams data update");
                        socket.emit('mlbcreatebuild-success', senddata);
                    }
                })

                // socket.emit('mlbcreatebuild-success', allTeams,WR_Players,QB_Players,RB_Players,TE_Players,FLEX_Players,DST_Players);
                


                // console.log("allTeams: ", allTeams);
                // res.send({ status: 0, allTeams, salaryArray });
                // res.send({ PG_Players, SG_Players, PF_Players, SF_Players, G_Players, F_Players, UTIL_Players});  

                //     }
                // })

            })
    }
    catch (error) {

        console.log(error);
        var response = {
            status: 1, success: false, messages: "something went wrong"
        }
        socket.emit('mlbcreatebuild-success', response);
        // console.log(error);
        // res.send({ error, status: 1, success: false, messages: "something went wrong" });
    }
}

module.exports.nextsocket_create_build_fandual = async function (io, socket, req) {
    try {

        let istest = await SlatPlayers.findOne({SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, { Players: 1, Teams: 1 });
        console.log("istest", istest.Teams.length)
        var AllTypePlayers = istest.Players[0];
        var AllTypeTeams = istest.Teams;

        let P_Players = AllTypePlayers.P;
        let C1B_Players = AllTypePlayers.C1B;
        let SS_Players = AllTypePlayers.SS;
        let OF_Players = AllTypePlayers.OF;
        let UTIL_Players = AllTypePlayers.UTIL;
        let B2_Players = AllTypePlayers.B2;
        let B3_Players = AllTypePlayers.B3;
        let All_Players = AllTypePlayers.All;
        let excludePlayers = AllTypePlayers.Exclude;
        let alockedPlayers = AllTypePlayers.Lock;
        let exposurePlayer = {};
        if(AllTypePlayers.Exposure){
            exposurePlayer = AllTypePlayers.Exposure;
        }
        let complete = [];
        let allTeams = [];
        let teamArray = [];
        var currentdate = moment().tz("America/New_York").format('YYYY-MM-DDT00:00:00');

        let no_of_builds = 1500;
        let get_builds = req.NumberOfBuild;
        // let get_builds = 5;
        let fandualpositions = ["P", "C/1B", "2B", "3B", "SS", "OF", "UTIL"];
        let positions = ["P", "OF", "C/1B", "2B", "3B", "SS", "OF2", "OF3", "UTIL"];
        let newPos = [0, 2, 3, 4, 5, 1, 6, 7, 8];
        // let positions = ["G"];
        let SlateID = req.SlateID;
        let user = req.user;


        if (AllTypeTeams.length > 0) {
            allTeams = AllTypeTeams;
            get_builds = get_builds + AllTypeTeams.length;
            console.log(allTeams.length, AllTypeTeams.length, get_builds);
        }

        All_Players = Array.from(new Set(All_Players.map(a => a.PlayerID)))
            .map(PlayerID => {
                return All_Players.find(a => a.PlayerID === PlayerID)
            })



        let LockedTeams = {};
        let stackPlayers = [];
        let SecondstackPlayers = [];
        let no_of_player = 0;
        let orderstatus = 0;

        await PlayerPerTeam.find({ slatId: SlateID, user: user })
            .then(async teams => {
                // console.log("TEams ", teams);
                if (teams.length > 0) {
                    let teamStack = teams[0].teamStack;
                    let batterorder = teams[0].batterorder;
                    teamStack = teamStack.filter(item => item.minNoOfPlayer > 0);
                    teamStack = teamStack.sort((a, b) => {
                        return (b.order - a.order)
                    })
                    // console.log("TEams ", teamStack);
                    let teamStack_length = teamStack.length;
                    for (let i = 0; i < teamStack_length; i++) {
                        // console.log("TEams ", teams[0].orderstatus, teams[0].batterorder,);
                        // console.log("TEams ", teamStack[i].teamId, teamStack[i].minNoOfPlayer);
                        if (teamStack[i].minNoOfPlayer > 0) {
                            orderstatus = teams[0].orderstatus;
                            // console.log("TEams ", orderstatus, batterorder,);
                            // console.log("TEams ", teamStack[i].teamId, teamStack[i].minNoOfPlayer);
                            // console.log("TEams ", teamStack[i].teamId, teamStack[i].HomeCheckbox, teamStack[i].AwayCheckbox);
                            let isbatterOrder = teamStack[i].HomeCheckbox;
                            // console.log("isbatterOrder",isbatterOrder);
                            if (isbatterOrder == undefined) {
                                // console.log("enter");
                                isbatterOrder = teamStack[i].AwayCheckbox;
                            }
                            // console.log("isbatterOrder2222", isbatterOrder);
                            let Allteam_Players = All_Players.filter(item => item.TeamID == teamStack[i].teamId);
                            if (isbatterOrder == true) {
                                Allteam_Players = Allteam_Players.sort((a, b) => {
                                    return (a.BattingOrder - b.BattingOrder)
                                })
                            } else {
                                Allteam_Players = Allteam_Players.sort((a, b) => {
                                    return (b.FandDualProjection - a.FandDualProjection)
                                })
                            }

                            // console.log("players", teamStack[i].teamId, teamStack[i].minNoOfPlayer);
                            // console.log(lockedPlayers.length);
                            if (stackPlayers.length == 0) {
                                no_of_player = teamStack[i].minNoOfPlayer;
                                // console.log("enter 1");

                                if (isbatterOrder == true) {
                                    no_player = teamStack[i].minNoOfPlayer;
                                } else {
                                    no_player = teamStack[i].minNoOfPlayer + 1;
                                }
                                for (let j = 0; j < no_player; j++) {
                                    if (isbatterOrder == true) {
                                        no = batterorder[j] - 1;
                                    } else {
                                        no = j;
                                    }
                                    // console.log(j, no, batterorder[j]);
                                    // console.log(j,no,batterorder[j], Allteam_Players[no].Name, Allteam_Players[no].TeamID,Allteam_Players[no].PlayerID,Allteam_Players[no].FanDuelSalary,Allteam_Players[no].BattingOrder, Allteam_Players[no].DepthChartPosition);
                                    exposurePlayer[Allteam_Players[no].PlayerID] = 1500;
                                    stackPlayers.push(Allteam_Players[no]);

                                }

                            } else {

                                // console.log("enter 2");

                                if (isbatterOrder == true) {
                                    // console.log("enter 3");
                                    // no_of_player = teamStack[i].minNoOfPlayer;
                                    for (let j = 0; j < teamStack[i].minNoOfPlayer; j++) {
                                        no = batterorder[j] - 1;
                                        // console.log(j, no, batterorder[j]);
                                        // console.log(j,no,batterorder[j], Allteam_Players[no].Name, Allteam_Players[no].TeamID,Allteam_Players[no].PlayerID,Allteam_Players[no].FanDuelSalary, Allteam_Players[no].BattingOrder, Allteam_Players[no].DepthChartPosition);
                                        exposurePlayer[Allteam_Players[no].PlayerID] = 1500;
                                        SecondstackPlayers.push(Allteam_Players[no]);
                                    }
                                } else {

                                    Allteam_Players = Allteam_Players.filter(item => item.FanDuelSalary <= 4000);
                                    // console.log("enter 4",Allteam_Players.length);
                                    for (let j = 0; j < 20; j++) {
                                        let n = Math.floor(Math.random() * Math.floor(Allteam_Players.length));
                                        // console.log(n, Allteam_Players[n].Name, Allteam_Players[n].PlayerID, Allteam_Players[n].FanDuelSalary, Allteam_Players[no].BattingOrder, Allteam_Players[no].DepthChartPosition);
                                        var indexof = SecondstackPlayers.indexOf(Allteam_Players[n]);
                                        if (indexof == -1) {
                                            exposurePlayer[Allteam_Players[n].PlayerID] = 1500;
                                            SecondstackPlayers.push(Allteam_Players[n]);
                                        }
                                        if (SecondstackPlayers.length >= teamStack[i].minNoOfPlayer) {
                                            j = 20;
                                        }
                                    }
                                }
                            }

                            // if (stackPlayers.length == 0) {
                            //     no_of_player = teamStack[i].minNoOfPlayer
                            //     for (let j = 0; j < teamStack[i].minNoOfPlayer + 1; j++) {
                            //         if (orderstatus == 1) {
                            //             no = batterorder[j] - 1;
                            //         } else {
                            //             no = j;
                            //         }
                            //         // console.log(j, batterorder[j], Allteam_Players[no].Name, Allteam_Players[no].PlayerID, Allteam_Players[no].FanDuelSalary, Allteam_Players[no].BattingOrder, Allteam_Players[no].DepthChartPosition);

                            //         exposurePlayer[Allteam_Players[no].PlayerID] = 1500;
                            //         stackPlayers.push(Allteam_Players[no]);

                            //     }

                            // } else {

                            //     Allteam_Players = Allteam_Players.filter(item => item.FanDuelSalary <= 6000);

                            //     for (let j = 0; j < teamStack[i].minNoOfPlayer; j++) {

                            //         let n = Math.floor(Math.random() * Math.floor(Allteam_Players.length));
                            //         // console.log(n, Allteam_Players[n].Name, Allteam_Players[n].PlayerID,Allteam_Players[n].FanDuelSalary, Allteam_Players[n].DraftKingsProjection);
                            //         exposurePlayer[Allteam_Players[n].PlayerID] = 1500;
                            //         SecondstackPlayers.push(Allteam_Players[n]);

                            //     }

                            // }

                            LockedTeams[teamStack[i].teamId] = teamStack[i].minNoOfPlayer;


                        }
                    }
                }
            })
            .catch(error => {
                // console.log("player per team error",error);
                // logger.error("Playerper team" + JSON.stringify(error));

            })

        if (SecondstackPlayers) {
            alockedPlayers = alockedPlayers.concat(SecondstackPlayers);
        }

        // console.log("Player Per Team Lockeduserteam: ", Lockeduserteam);

        let complete_team = 0;
        let count = 0;
        let reqsalary = 34000;
        let teamcreate = 0;
        let l = 1;
        for (let j = 0; j <= no_of_builds; j++) {
            let team = [];
            let select_player = [];
            let teamCount = 1;
            // let complete_team = 0;
            let salary = 35000;
            if (orderstatus == 1) {
                if (stackPlayers.length > 0) {
                    select_player = stackPlayers;
                }

            } else {
                if (stackPlayers.length > 0) {
                    for (let p = 0; p < 20; p++) {
                        let n = Math.floor(Math.random() * Math.floor(no_of_player + 1));
                        // console.log(p,n);
                        var indexof = select_player.indexOf(stackPlayers[n]);
                        if (indexof == -1) {
                            // console.log("player", n);
                            select_player.push(stackPlayers[n]);
                        }

                        if (select_player.length >= no_of_player) {
                            p = 20;
                        }
                    }
                }
            }
            let lockedPlayers = alockedPlayers.concat(select_player);
            // console.log("select_player.lentgh: ",select_player.length,lockedPlayers.length,lockedPlayers); 
            for (let k = 0; k < positions.length; k++) {
                let position = positions[k];
                // console.log("position: ", position, " k: ", k, "j:", j);

                if (position === "P") {
                    P_Players = P_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));


                    P_Players = P_Players.sort((a, b) => {
                        return (b.FandDualProjection - a.FandDualProjection);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.FanDuelSalary;
                    }, 0);

                    let lastPlayerSal = (Math.abs(35000 / 9));
                    // console.log("last player sal In P: ", lastPlayerSal);  

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    for (let i = 0; i < length;) {
                        if (P_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {
                                    // console.log("not enter");

                                    i++;
                                    continue;

                                }

                            } else {
                                // console.log("team",team);
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                // console.log("sucess in lock",sucess);
                                i = length;
                                continue;
                            }

                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }


                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("C_sucessPlayers");
                        sucess = firstPLayerpitcher(teamArray, P_Players, team, k, LockedTeams, lastPlayerSal, position);

                    }

                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, P_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    // console.log("sucess",sucess);
                }

                if (position === "C/1B") {
                    C1B_Players = C1B_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));


                    C1B_Players = C1B_Players.sort((a, b) => {
                        return (b.FandDualProjection - a.FandDualProjection);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.FanDuelSalary;
                    }, 0);

                    let remainingplayer = positions.length - k;
                    // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                    let lastPlayerSal = (Math.abs(35000 - teamSalary) / remainingplayer);

                    // console.log("last player sal In C/1B: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    for (let i = 0; i < length;) {
                        if (C1B_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {
                                    // console.log("not enter");
                                    // sucess =  addtolineup(teamArray, PF_Players, team, k, LockedTeams, position);
                                    // i = length;
                                    i++;
                                    continue;

                                }

                            } else {
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                i = length;
                                continue;
                            }
                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("PF_sucessPlayers");
                        if (lastPlayerSal > 4500) {
                            sucess = lastPlayer(teamArray, C1B_Players, team, k, LockedTeams, lastPlayerSal, position);
                        } else if (lastPlayerSal < 3000) {
                            sucess = takelowplayer(teamArray, C1B_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                        else {
                            sucess = addtolineup(teamArray, C1B_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }


                    }

                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, C1B_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    // console.log("sucess",sucess);

                }

                if (position === "2B") {
                    B2_Players = B2_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));


                    B2_Players = B2_Players.sort((a, b) => {
                        return (b.FandDualProjection - a.FandDualProjection);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.FanDuelSalary;
                    }, 0);

                    let remainingplayer = positions.length - k;
                    // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                    let lastPlayerSal = (Math.abs(35000 - teamSalary) / remainingplayer);

                    // console.log("last player sal In 2B: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    for (let i = 0; i < length;) {
                        if (B2_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {
                                    // console.log("not enter");
                                    // sucess =  addtolineup(teamArray, SF_Players, team, k, LockedTeams, position);
                                    // i = length;
                                    i++;
                                    continue;

                                }

                            } else {
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                i = length;
                                continue;
                            }
                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("SF_sucessPlayers");

                        if (lastPlayerSal > 4500) {
                            sucess = lastPlayer(teamArray, B2_Players, team, k, LockedTeams, lastPlayerSal, position);
                        } else if (lastPlayerSal < 3000) {
                            sucess = takelowplayer(teamArray, B2_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                        else {
                            sucess = addtolineup(teamArray, B2_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }



                    }

                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, B2_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }
                    // console.log("sucess",sucess);

                }

                if (position === "3B") {
                    B3_Players = B3_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    B3_Players = B3_Players.sort((a, b) => {
                        return (b.FandDualProjection - a.FandDualProjection);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.FanDuelSalary;
                    }, 0);

                    let remainingplayer = positions.length - k;
                    // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                    let lastPlayerSal = (Math.abs(35000 - teamSalary) / remainingplayer);

                    // console.log("last player sal In 3B: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    for (let i = 0; i < length;) {
                        if (B3_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {
                                    // console.log("not enter");
                                    // sucess =  addtolineup(teamArray, SG_Players, team, k, LockedTeams, position);
                                    // i = length;
                                    i++;
                                    continue;

                                }

                            } else {
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                i = length;
                                continue;
                            }

                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("SG_sucessPlayers");
                        if (lastPlayerSal > 4500) {
                            sucess = lastPlayer(teamArray, B3_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                        else if (lastPlayerSal < 3000) {
                            sucess = takelowplayer(teamArray, B3_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                        else {
                            sucess = addtolineup(teamArray, B3_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }

                    }

                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, B3_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    // console.log("sucess",sucess);

                }

                if (position === "SS") {
                    SS_Players = SS_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));


                    SS_Players = SS_Players.sort((a, b) => {
                        return (b.FandDualProjection - a.FandDualProjection);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        return acc + item.FanDuelSalary;
                    }, 0);

                    let remainingplayer = positions.length - k;
                    // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                    let lastPlayerSal = (Math.abs(35000 - teamSalary) / remainingplayer);
                    // console.log("last player sal In SS: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    let playerCount = {};
                    for (let i = 0; i < length;) {
                        if (SS_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {
                                    // console.log("not enter");
                                    // sucess =  firstPLayer(teamArray, PG_Players, team, k, LockedTeams, position);
                                    // i = length;
                                    i++;
                                    continue;

                                }

                            } else {
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                i = length;
                                continue;
                            }


                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("PG_sucessPlayers");

                        if (lastPlayerSal > 4500) {
                            sucess = lastPlayer(teamArray, SS_Players, team, k, LockedTeams, lastPlayerSal, position);
                        } else if (lastPlayerSal < 3000) {
                            sucess = takelowplayer(teamArray, SS_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                        else {
                            sucess = addtolineup(teamArray, SS_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                    }



                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, SS_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    // console.log("sucess",sucess);

                }

                if (position === "OF") {
                    OF_Players = OF_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));


                    OF_Players = OF_Players.sort((a, b) => {
                        return (b.FandDualProjection - a.FandDualProjection);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        return acc + item.FanDuelSalary;
                    }, 0);

                    let remainingplayer = positions.length - k;
                    // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                    let lastPlayerSal = (Math.abs(35000 - teamSalary) / remainingplayer);
                    // console.log("last player sal In OF: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    let playerCount = {};
                    for (let i = 0; i < length;) {
                        if (OF_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {
                                    // console.log("not enter");
                                    // sucess =  firstPLayer(teamArray, PG_Players, team, k, LockedTeams, position);
                                    // i = length;
                                    i++;
                                    continue;

                                }

                            } else {
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                i = length;
                                continue;
                            }


                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("PG_sucessPlayers");

                        if (lastPlayerSal > 4500) {
                            sucess = lastPlayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                        } else if (lastPlayerSal < 3000) {
                            sucess = takelowplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                        else {
                            sucess = addtolineup(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                    }



                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    // console.log("sucess",sucess);

                }

                if (position === "OF2") {
                    OF_Players = OF_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));


                    OF_Players = OF_Players.sort((a, b) => {
                        return (b.FandDualProjection - a.FandDualProjection);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        return acc + item.FanDuelSalary;
                    }, 0);

                    let remainingplayer = positions.length - k;
                    // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                    let lastPlayerSal = (Math.abs(35000 - teamSalary) / remainingplayer);
                    // console.log("last player sal In OF2: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    let playerCount = {};
                    for (let i = 0; i < length;) {
                        if (OF_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {
                                    // console.log("not enter");
                                    // sucess =  firstPLayer(teamArray, PG_Players, team, k, LockedTeams, position);
                                    // i = length;
                                    i++;
                                    continue;

                                }

                            } else {
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                i = length;
                                continue;
                            }


                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("PG_sucessPlayers");

                        if (lastPlayerSal > 4000) {
                            sucess = lastPlayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                        else if (lastPlayerSal < 3000) {
                            sucess = takelowplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                        else {
                            sucess = addtolineup(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                    }



                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    // console.log("sucess",sucess);

                }

                if (position === "OF3") {
                    OF_Players = OF_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));


                    OF_Players = OF_Players.sort((a, b) => {
                        return (b.FandDualProjection - a.FandDualProjection);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        return acc + item.FanDuelSalary;
                    }, 0);

                    let remainingplayer = positions.length - k;
                    // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                    let lastPlayerSal = (Math.abs(35000 - teamSalary) / remainingplayer);
                    // console.log("last player sal In OF3: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    let playerCount = {};
                    for (let i = 0; i < length;) {
                        if (OF_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {
                                    // console.log("not enter");
                                    // sucess =  firstPLayer(teamArray, PG_Players, team, k, LockedTeams, position);
                                    // i = length;
                                    i++;
                                    continue;

                                }

                            } else {
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                i = length;
                                continue;
                            }


                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("PG_sucessPlayers");
                        if (lastPlayerSal > 4000) {
                            sucess = lastPlayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                        else if (lastPlayerSal < 3000) {
                            sucess = takelowplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                        else {
                            sucess = addtolineup(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                    }



                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, OF_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    // console.log("sucess",sucess);

                }

                if (position === "UTIL") {
                    UTIL_Players = UTIL_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));


                    UTIL_Players = UTIL_Players.sort((a, b) => {
                        return (b.FandDualProjection - a.FandDualProjection);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        return acc + item.FanDuelSalary;
                    }, 0);

                    let remainingplayer = positions.length - k;
                    // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                    let lastPlayerSal = (Math.abs(35000 - teamSalary) / remainingplayer);
                    // console.log("last player sal In UTIL: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    let playerCount = {};
                    for (let i = 0; i < length;) {
                        if (UTIL_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                            let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                            if (j != 0) {
                                playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                if (!playerCount) {
                                    newcount = 0;
                                } else {
                                    newcount = playerCount.count;
                                }
                                // console.log("Count",playerCount);
                                // console.log("onlyCount", newcount);
                                if (newcount < playerexpo) {
                                    // console.log("enter");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                } else {
                                    // console.log("not enter");
                                    // sucess =  firstPLayer(teamArray, PG_Players, team, k, LockedTeams, position);
                                    // i = length;
                                    i++;
                                    continue;

                                }

                            } else {
                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                i = length;
                                continue;
                            }


                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("PG_sucessPlayers");

                        // if (lastPlayerSal > 2500) {
                        sucess = lastPlayerutil(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                        // }
                        // else {
                        //     sucess = addtolineup(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                        // }
                    }



                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    // console.log("sucess",sucess);

                }

            }

            function includelockPLayer(teamArr, playerArr, team, k, position) {


                if (teamArr.filter(el => el.TeamID == playerArr.TeamID).length == 0) {
                    // console.log("Before update: 3");
                    teamArr.push({ PlayerId: playerArr.PlayerID });
                    teamArr.push({ TeamID: playerArr.TeamID, teamCount });
                }
                else {
                    // console.log("Before update: 4");
                    let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr.TeamID));
                    if (teamArr[objIndex].teamCount < 4) {
                        // console.log("Before update: 5");
                        teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                        teamArr.push({ PlayerId: playerArr.PlayerID });
                    }
                    else {
                        // console.log("Before update: 6");
                        return 0;
                    }
                }

                if (complete.filter(el => el.id == playerArr.PlayerID).length == 0) {
                    // console.log("Before update: 1");
                    count = 1;
                    let playerDataWithCount = {
                        id: playerArr.PlayerID,
                        TeamID: playerArr.TeamID,
                        count: count
                    }
                    complete.push(playerDataWithCount);
                }
                else {

                    // console.log("Before update: 2");
                    let objIndex = complete.findIndex((obj => obj.id == playerArr.PlayerID));
                    // console.log("Before update: ", complete[objIndex]);
                    complete[objIndex].count = complete[objIndex].count + 1;
                }

                team[k] = playerArr;
                return 1;
            }

            function firstPLayerpitcher(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position) {

                // console.log("lockedTeams: ", LockedTeams);
                // console.log("PlayerArray: ", teamArr); 
                let playerlength = 0;
                let playerArr = [];

                if (LockedTeams) {
                    // array exists and is not empty
                    // console.log("lockedTeams: Last ", LockedTeams['9']);

                    for (const [key, value] of Object.entries(LockedTeams)) {
                        // console.log(key , value);
                        let array1 = AllplayerArr.filter(obj => {

                            // console.log("array :1 ", obj.TeamID); 
                            return obj.TeamID == key
                        });
                        array1 = Object.assign(array1);
                        playerArr = playerArr.concat(array1);
                        // playerArr.push(array1);
                    }
                }

                playerArr = AllplayerArr.filter(elm => !playerArr.map(elm => JSON.stringify(elm))
                    .includes(JSON.stringify(elm)));


                if (playerArr.length > 10) {
                    playerlength = 9;
                } else {
                    playerlength = playerArr.length - 1;
                }

                let length = playerArr.length + 30;

                for (let i = 0; i < length;) {
                    let n = Math.floor(Math.random() * Math.floor(playerlength));
                    // console.log("teamId 111: ", playerArr[n].FanDuelSalary);

                    let needvalue = 1.5;

                    if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                        && playerArr[n].FandDualProjection >= 3 && playerArr[n].FanDualVal >= needvalue) {

                        if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                            teamArr.push({ PlayerId: playerArr[n].PlayerID });
                            teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                        }
                        else {
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                            }
                            else {
                                i++;
                                continue;
                            }
                        }

                        if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                            count = 1;
                            let playerDataWithCount = {
                                id: playerArr[n].PlayerID,
                                TeamID: playerArr[n].TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {
                            let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }

                        salary = salary - playerArr[n].FanDuelSalary;
                        team[k] = playerArr[n];
                        i = length;
                        // console.log("in compare team: ", team);
                        return 1;
                    }
                    else {
                        i++;
                    }
                }

            }

            function firstPLayer(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position) {

                // console.log("lockedTeams: ", LockedTeams);
                // console.log("PlayerArray: ", teamArr); 
                let playerArr = [];
                let playerlength = 0;
                let teamfilter = 0;

                if (LockedTeams) {
                    // array exists and is not empty
                    // console.log("lockedTeams: Last ", LockedTeams['9']);

                    for (const [key, value] of Object.entries(LockedTeams)) {
                        // console.log(key , value);
                        if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                            // console.log("yes:",);
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                            // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                            if (value > teamArr[objIndex].teamCount) {
                                // console.log("Teamid",key); 
                                // filter lock teams
                                let array1 = AllplayerArr.filter(obj => {

                                    // console.log("array :1 ", obj.TeamID); 
                                    return obj.TeamID == key
                                });
                                array1 = Object.assign(array1);
                                playerArr = playerArr.concat(array1);
                                // playerArr.push(array1);
                            }
                        } else {
                            // console.log("Teamid",key); 
                            let array1 = AllplayerArr.filter(obj => {

                                // console.log("array :1 ", obj.TeamID); 
                                return obj.TeamID == key
                            });
                            array1 = Object.assign(array1);
                            playerArr = playerArr.concat(array1);
                            // playerArr.push(array1);

                        }

                    }
                }


                // console.log("arrayfinal ", playerArr.length);

                playerArr = playerArr.filter(item => item.FandDualProjection != 0);

                if (playerArr.length == 0) {
                    playerArr = AllplayerArr;
                    teamfilter = 1;
                    playerlength = 4;

                } else {

                    playerlength = playerArr.length;
                }

                // console.log("arrayfinal ", playerArr.length);

                let addlastPlayerSal = lastPlayerSal - 500;

                let length = playerArr.length;

                if (teamfilter === 1) {
                    for (let i = 0; i < length;) {
                        let n = Math.floor(Math.random() * Math.floor(playerlength));
                        // console.log("teamId 111: ", playerArr[n].FanDuelSalary);

                        let needvalue = 1.5;

                        if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                            && addlastPlayerSal >= playerArr[n].FanDuelSalary
                            && playerArr[n].FandDualProjection >= 3 && playerArr[n].FanDualVal >= needvalue) {

                            if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                            }
                            else {
                                let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                if (teamArr[objIndex].teamCount < 4) {
                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                }
                                else {
                                    i++;
                                    continue;
                                }
                            }

                            if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                count = 1;
                                let playerDataWithCount = {
                                    id: playerArr[n].PlayerID,
                                    TeamID: playerArr[n].TeamID,
                                    count: count
                                }
                                complete.push(playerDataWithCount);
                            }
                            else {
                                let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                // console.log("Before update: ", complete[objIndex]);
                                complete[objIndex].count = complete[objIndex].count + 1;
                            }

                            salary = salary - playerArr[n].FanDuelSalary;
                            team[k] = playerArr[n];
                            i = length;
                            // console.log("in compare team: ", team);
                            return 1;
                        }
                        else {
                            i++;
                        }
                    }

                } else {

                    length = length + 30;
                    for (let i = 0; i < length;) {
                        let n = Math.floor(Math.random() * Math.floor(playerlength));
                        // console.log("teamId: ", playerArr[n].TeamID,playerArr[n].DraftKingsProjection,playerArr[n].DraftKingsVal);
                        let needvalue = 1;
                        // console.log("teamId 222: ", playerArr[n].FanDuelSalary,playerArr[n].FandDualProjection,playerArr[n].FanDualVal);
                        if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0 && playerArr[n].FandDualProjection >= 3 && playerArr[n].FanDualVal >= needvalue) {

                            if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                            }
                            else {
                                let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                if (teamArr[objIndex].teamCount < 4) {
                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                }
                                else {
                                    i++;
                                    continue;
                                }
                            }

                            if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                count = 1;
                                let playerDataWithCount = {
                                    id: playerArr[n].PlayerID,
                                    TeamID: playerArr[n].TeamID,
                                    count: count
                                }
                                complete.push(playerDataWithCount);
                            }
                            else {
                                let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                // console.log("Before update: ", complete[objIndex]);
                                complete[objIndex].count = complete[objIndex].count + 1;
                            }

                            salary = salary - playerArr[n].FanDuelSalary;
                            team[k] = playerArr[n];
                            i = length;
                            // console.log("in compare team: ", team);
                            return 1;
                        }
                        else {
                            i++;
                        }
                    }

                }
            }

            function takelowplayer(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position) {

                // console.log("low player ");

                let playerArr = [];
                let addlastPlayerSal = 0;
                let playerlength = 0;
                let teamfilter = 0;

                // if (LockedTeams) {
                //     // array exists and is not empty
                //     // console.log("lockedTeams: Last ", LockedTeams['9']);

                //     for (const [key, value] of Object.entries(LockedTeams)) {
                //         // console.log(key , value);
                //         // console.log("teamArr.length: ", teamArr.length); 
                //         // console.log("teamArr.filter(el => el.TeamID == key).length: ", teamArr.filter(el => el.TeamID == key).length); 
                //         if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                //             // console.log("yes:1",);
                //             let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                //             // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                //             if (value > teamArr[objIndex].teamCount) {
                //                 // console.log("Teenter",key); 
                //                 // filter lock teams
                //                 let array1 = AllplayerArr.filter(obj => {

                //                     // console.log("array :1 ", obj.TeamID); 
                //                     return obj.TeamID == key
                //                 });

                //                 array1 = Object.assign(array1);
                //                 playerArr = playerArr.concat(array1);
                //                 // playerArr.push(array1);
                //             }
                //         } else {
                //             // console.log("yes:2",);
                //             // console.log("Teamid",key); 
                //             let array1 = AllplayerArr.filter(obj => {

                //                 // console.log("array :1 ", obj.TeamID); 
                //                 return obj.TeamID == key
                //             });
                //             array1 = Object.assign(array1);
                //             playerArr = playerArr.concat(array1);
                //             // playerArr.push(array1);

                //         }

                //     }
                // }

                // console.log("add arrayfinal before", playerArr.length);
                // playerArr = playerArr.filter(item => item.DraftKingsProjection != 0);
                // playerArr = playerArr.filter(item => item.DraftKingsSalary <= 5000);

                if (playerArr.length == 0) {
                    playerArr = AllplayerArr;
                    addlastPlayerSal = 3500;
                    playerArr = playerArr.filter(item => item.FanDuelSalary <= addlastPlayerSal);
                    playerArr = playerArr.sort((a, b) => {
                        return (b.FandDualProjection - a.FandDualProjection)
                    })
                    if (playerArr.length > 15) {
                        playerlength = 14;
                    } else {
                        playerlength = playerArr.length - 1;
                    }
                    teamfilter = 1;

                } else {

                    addlastPlayerSal = 3500;
                    playerArr = playerArr.filter(item => item.FanDuelSalary <= addlastPlayerSal);
                    playerArr = playerArr.sort((a, b) => {
                        return (b.FandDualProjection - a.FandDualProjection)
                    })
                    playerlength = playerArr.length - 1;
                }

                // console.log("add arrayfinal ", playerArr.length);

                playerArr = playerArr.filter(item => item.DraftKingsSalary <= 4500);


                let length = playerArr.length + 40;
                // console.log("length ", length);
                if (teamfilter === 1) {
                    for (let i = 0; i < length;) {
                        let n = Math.floor(Math.random() * Math.floor(playerlength));
                        let needvalue = 1;

                        // console.log("teamId: ", playerArr[n].TeamID);
                        // console.log("position: ", n);
                        // console.log("playerArr[n]: ", playerArr[n].DraftKingsProjection,i,n,playerArr[n].DraftKingsVal,playerArr[n].DraftKingsSalary);
                        if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                            && addlastPlayerSal >= playerArr[n].DraftKingsSalary
                            && playerArr[n].DraftKingsProjection >= 5 && playerArr[n].DraftKingsVal >= needvalue) {
                            // console.log("position: enter3 ");
                            if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                // console.log("position: 3 ");
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                            }
                            else {
                                let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                if (teamArr[objIndex].teamCount < 4) {
                                    // console.log("position: 4 ");
                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                }
                                else {
                                    // console.log("position: 5 ");
                                    i++;
                                    continue;
                                }
                            }

                            if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                // console.log("position: 1 ");
                                count = 1;
                                let playerDataWithCount = {
                                    id: playerArr[n].PlayerID,
                                    TeamID: playerArr[n].TeamID,
                                    count: count
                                }
                                complete.push(playerDataWithCount);
                            }
                            else {
                                // console.log("position: 2 ");
                                let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                // console.log("Before update: ", complete[objIndex]);
                                complete[objIndex].count = complete[objIndex].count + 1;
                            }


                            // salary = salary - playerArr[n].DraftKingsSalary;
                            team[k] = playerArr[n];
                            i = length;
                            // console.log("in compare team: ", team);
                            return 1;
                        }
                        else {
                            i++;
                        }
                    }
                } else {

                    playerArr = playerArr.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection);
                    });

                    // length = length + 30;
                    for (let i = 0; i < playerArr.length;) {
                        let n = i;
                        let needvalue = 1;

                        // console.log("teamId: ", playerArr[n].TeamID);
                        // console.log("position: ", n);
                        // console.log("DraftKingsProjection: ", playerArr[n].DraftKingsProjection,i,n,playerArr[n].DraftKingsVal);
                        if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                            && playerArr[n].DraftKingsProjection >= 5 && playerArr[n].DraftKingsVal >= needvalue) {
                            // console.log("position: enter3 ");
                            if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                // console.log("position: 3 ");
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                            }
                            else {
                                let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                if (teamArr[objIndex].teamCount < 4) {
                                    // console.log("position: 4 ");
                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                }
                                else {
                                    // console.log("position: 5 ");
                                    i++;
                                    continue;
                                }
                            }

                            if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                // console.log("position: 1 ");
                                count = 1;
                                let playerDataWithCount = {
                                    id: playerArr[n].PlayerID,
                                    TeamID: playerArr[n].TeamID,
                                    count: count
                                }
                                complete.push(playerDataWithCount);
                            }
                            else {
                                // console.log("position: 2 ");
                                let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                // console.log("Before update: ", complete[objIndex]);
                                complete[objIndex].count = complete[objIndex].count + 1;
                            }


                            // salary = salary - playerArr[n].DraftKingsSalary;
                            team[k] = playerArr[n];
                            i = length;
                            // console.log("in compare team: ", team);
                            return 1;
                        }
                        else {
                            i++;
                        }
                    }
                }
            }

            function addtolineup(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position) {

                // console.log("lockedTeams: add to line up", LockedTeams);
                // console.log("PlayerArray: ", teamArr); 
                // console.log("Add to line up: ");

                let playerArr = [];
                let playerlength = 0;
                let teamfilter = 0;

                // if (LockedTeams) {
                //     // array exists and is not empty
                //     // console.log("lockedTeams: Last ", LockedTeams['9']);

                //     for (const [key, value] of Object.entries(LockedTeams)) {
                //         // console.log(key , value);
                //         // console.log("teamArr.length: ", teamArr.length); 
                //         // console.log("teamArr.filter(el => el.TeamID == key).length: ", teamArr.filter(el => el.TeamID == key).length); 
                //         if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                //             // console.log("yes:1",);
                //             let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                //             // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                //             if (value > teamArr[objIndex].teamCount) {
                //                 // console.log("Teenter",key); 
                //                 // filter lock teams
                //                 let array1 = AllplayerArr.filter(obj => {

                //                     // console.log("array :1 ", obj.TeamID); 
                //                     return obj.TeamID == key
                //                 });

                //                 array1 = Object.assign(array1);
                //                 playerArr = playerArr.concat(array1);
                //                 // playerArr.push(array1);
                //             }
                //         } else {
                //             // console.log("yes:2",);
                //             // console.log("Teamid",key); 
                //             let array1 = AllplayerArr.filter(obj => {

                //                 // console.log("array :1 ", obj.TeamID); 
                //                 return obj.TeamID == key
                //             });
                //             array1 = Object.assign(array1);
                //             playerArr = playerArr.concat(array1);
                //             // playerArr.push(array1);

                //         }

                //     }
                // }

                // console.log("arrayfinal before", playerArr.length);
                // playerArr = playerArr.filter(item => item.FandDualProjection != 0);

                if (playerArr.length == 0) {
                    playerArr = AllplayerArr;
                    playerArr = playerArr.filter(item => item.FandDualProjection != 0);
                    playerArr = playerArr.sort((a, b) => {
                        return (b.FandDualProjection - a.FandDualProjection)
                    })
                    teamfilter = 1;
                    if (playerArr.length > 16) {
                        playerlength = 15;
                    } else {
                        playerlength = playerArr.length - 1;
                    }

                } else {

                    playerArr = playerArr.filter(item => item.FandDualProjection != 0);
                    playerArr = playerArr.sort((a, b) => {
                        return (b.FandDualProjection - a.FandDualProjection)
                    })
                    playerlength = playerArr.length - 1;
                }

                // console.log("arrayfinal ", playerArr.length);

                let addlastPlayerSal = lastPlayerSal;

                // console.log("addlastPlayerSal ", addlastPlayerSal);

                let length = playerArr.length + 30;
                if (teamfilter === 1) {
                    for (let i = 0; i < length;) {
                        let n = Math.floor(Math.random() * Math.floor(playerlength));
                        // console.log("teamId: ", playerArr[n].TeamID);
                        // console.log("position: ", n);
                        // console.log("add to line up salary 11: ", playerArr[n].FanDuelSalary,playerArr[n].FandDualProjection,playerArr[n].FanDualVal);
                        let needvalue = 1.5;
                        if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                            && playerArr[n].FandDualProjection >= 3 && playerArr[n].FanDualVal >= needvalue) {
                            // console.log("position: enter3 ");
                            if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                // console.log("position: 3 ");
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                            }
                            else {
                                let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                if (teamArr[objIndex].teamCount < 4) {
                                    // console.log("position: 4 ");
                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                }
                                else {
                                    // console.log("position: 5 ");
                                    i++;
                                    continue;
                                }
                            }

                            if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                // console.log("position: 1 ");
                                count = 1;
                                let playerDataWithCount = {
                                    id: playerArr[n].PlayerID,
                                    TeamID: playerArr[n].TeamID,
                                    count: count
                                }
                                complete.push(playerDataWithCount);
                            }
                            else {
                                // console.log("position: 2 ");
                                let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                // console.log("Before update: ", complete[objIndex]);
                                complete[objIndex].count = complete[objIndex].count + 1;
                            }


                            // salary = salary - playerArr[n].DraftKingsSalary;
                            team[k] = playerArr[n];
                            i = length;
                            // console.log("in compare team: ", team);
                            return 1;
                        }
                        else {
                            i++;
                        }
                    }
                } else {

                    playerArr = playerArr.sort((a, b) => {
                        return (b.FandDualProjection - a.FandDualProjection);
                    });

                    length = length + 30;
                    for (let i = 0; i < length;) {
                        // let n = Math.floor(Math.random() * Math.floor(playerlength));
                        let n = i;
                        // console.log("teamId: ", playerArr[n].TeamID,playerArr[n].DraftKingsProjection,playerArr[n].DraftKingsVal);
                        let needvalue = 1;
                        // console.log("add to line up salary 22: ", playerArr[n].FanDuelSalary);
                        if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                            && playerArr[n].FandDualProjection >= 3 && playerArr[n].FanDualVal >= needvalue) {
                            // console.log("position: enter3 ");
                            if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                // console.log("position: 3 ");
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                            }
                            else {
                                let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                if (teamArr[objIndex].teamCount < 4) {
                                    // console.log("position: 4 ");
                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                }
                                else {
                                    // console.log("position: 5 ");
                                    i++;
                                    continue;
                                }
                            }

                            if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                // console.log("position: 1 ");
                                count = 1;
                                let playerDataWithCount = {
                                    id: playerArr[n].PlayerID,
                                    TeamID: playerArr[n].TeamID,
                                    count: count
                                }
                                complete.push(playerDataWithCount);
                            }
                            else {
                                // console.log("position: 2 ");
                                let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                // console.log("Before update: ", complete[objIndex]);
                                complete[objIndex].count = complete[objIndex].count + 1;
                            }


                            // salary = salary - playerArr[n].DraftKingsSalary;
                            team[k] = playerArr[n];
                            i = length;
                            // console.log("in compare team: ", team);
                            return 1;
                        }
                        else {
                            i++;
                        }
                    }
                }
            }

            function randomplayer(teamArr, playerArr, team, k, LockedTeams, lastPlayerSal, position) {

                // console.log("Random: ");
                let addlastPlayerSal = 2000;

                resultA = playerArr.sort((a, b) => {
                    return (b.FandDualProjection - a.FandDualProjection)
                })

                let length = playerArr.length + 30;
                for (let i = 0; i < length;) {
                    let playerlength = 9;
                    let n = Math.floor(Math.random() * Math.floor(playerlength));
                    let needvalue = 1;
                    // console.log("teamId: ", playerArr[n].TeamID);
                    // console.log("position: ", n);
                    // console.log("random salary: ", playerArr[n].FanDuelSalary,playerArr[n].FandDualProjection);
                    if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                        && playerArr[n].FandDualProjection >= 3 && playerArr[n].FanDualVal >= needvalue) {
                        // console.log("position: enter3 ");
                        if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                            // console.log("position: 3 ");
                            teamArr.push({ PlayerId: playerArr[n].PlayerID });
                            teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                        }
                        else {
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                // console.log("position: 4 ");
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                            }
                            else {
                                // console.log("position: 5 ");  
                                i++;
                                continue;
                            }
                        }

                        if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                            // console.log("position: 1 ");
                            count = 1;
                            let playerDataWithCount = {
                                id: playerArr[n].PlayerID,
                                TeamID: playerArr[n].TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {
                            // console.log("position: 2 ");
                            let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }


                        // salary = salary - playerArr[n].DraftKingsSalary;
                        team[k] = playerArr[n];
                        i = length;
                        // console.log("in compare team: ", team);
                        return 1;
                    }
                    else {
                        i++;
                    }
                }
            }

            function lastPlayer(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position) {


                // console.log("last player: ");

                let playerArr = [];
                let playerlength = 0;

                if (LockedTeams) {
                    // array exists and is not empty
                    // console.log("lockedTeams: Last ", LockedTeams['9']);

                    for (const [key, value] of Object.entries(LockedTeams)) {
                        // console.log(key , value);
                        // console.log("teamArr.length: ", teamArr.length); 
                        // console.log("teamArr.filter(el => el.TeamID == key).length: ", teamArr.filter(el => el.TeamID == key).length); 
                        if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                            // console.log("yes:1",);
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                            // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                            if (value > teamArr[objIndex].teamCount) {
                                // console.log("Teenter",key); 
                                // filter lock teams
                                let array1 = AllplayerArr.filter(obj => {

                                    // console.log("array :1 ", obj.TeamID); 
                                    return obj.TeamID == key
                                });

                                array1 = Object.assign(array1);
                                playerArr = playerArr.concat(array1);
                                // playerArr.push(array1);
                            }
                        } else {
                            // console.log("yes:2",);
                            // console.log("Teamid",key); 
                            let array1 = AllplayerArr.filter(obj => {

                                // console.log("array :1 ", obj.TeamID); 
                                return obj.TeamID == key
                            });
                            array1 = Object.assign(array1);
                            playerArr = playerArr.concat(array1);
                            // playerArr.push(array1);

                        }

                    }
                }

                // console.log("add arrayfinal before", playerArr.length);


                if (playerArr.length == 0) {
                    playerArr = AllplayerArr;
                    addlastPlayerSal = lastPlayerSal;
                    if (playerArr.length > 15) {
                        playerlength = 14;
                    } else {
                        playerlength = playerArr.length;
                    }
                    teamfilter = 1;

                } else {

                    addlastPlayerSal = 7000;

                    playerlength = playerArr.length - 1;
                }

                playerArr = playerArr.filter(item => item.FandDualProjection != 0);

                // console.log("add arrayfinal ", playerArr.length);

                resultA = playerArr.sort((a, b) => {
                    return (b.FanDuelSalary - a.FanDuelSalary) || (b.FandDualProjection - a.FandDualProjection)
                })

                // console.log("resultA: ",resultA);
                let length = resultA.length + 30;
                // console.log("resultA: ",teamCount);
                for (let i = 0; i <= length;) {

                    let l = Math.floor(Math.random() * Math.floor(playerlength));
                    let needvalue = 1.5;
                    // console.log("teamId: ", resultA[l].TeamID);
                    // console.log("result inside l: ",l,resultA[l].FanDuelSalary,resultA[l].Name,resultA[l].FandDualProjection,resultA[l].FanDualVal);
                    // if (resultA[l].DepthChartOrder == '0') {
                    // console.log("last player result Sallary l: ",resultA[l].FanDuelSalary,resultA[l].Name,resultA[l].FanDualVal);

                    if (teamArr.filter(item => item.PlayerId == resultA[l].PlayerID).length == 0
                        && lastPlayerSal >= resultA[l].FanDuelSalary
                        && resultA[l].FandDualProjection >= 3 && resultA[l].FanDualVal >= needvalue) {

                        if (teamArr.filter(el => el.TeamID == resultA[l].TeamID).length == 0) {
                            // console.log("resultA: 3");
                            teamArr.push({ PlayerId: resultA[l].PlayerID });
                            teamArr.push({ TeamID: resultA[l].TeamID, teamCount });
                        }
                        else {
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == resultA[l].TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                // console.log("resultA: 4");
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: resultA[l].PlayerID });
                            }
                            else {
                                // console.log("resultA: 5");
                                i++;
                                continue;
                            }
                        }

                        if (complete.filter(el => el.id == resultA[l].PlayerID).length == 0) {
                            // console.log("resultA: 1");
                            count = 1;
                            let playerDataWithCount = {
                                id: resultA[l].PlayerID,
                                TeamID: resultA[l].TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {
                            // console.log("resultA: 2");
                            let objIndex = complete.findIndex((obj => obj.id == resultA[l].PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }


                        // salary = salary - playerArr[l].DraftKingsSalary;
                        // console.log("teamArr: ",teamArr);
                        team[k] = resultA[l];
                        // console.log("in compare team: ", team);
                        i = length;

                        return 1;

                    }
                    else {
                        i++;
                        continue;
                    }
                    //}else{

                    //  l++;
                    // }
                }
            }

            function lastPlayerutil(teamArr, playerArr, team, k, LockedTeams, lastPlayerSal, position) {


                // let resultA = playerArr.filter(elm => !teamArr.map(elm => JSON.stringify(elm))
                //     .includes(JSON.stringify(elm)));

                // let resultPLayerA= playerArr.filter(function(cv){
                //     return !teamArr.find(function(e){
                //         return e.PlayerId == cv.PlayerID;
                //     });
                // });

                playerArr = playerArr.filter(item => item.FanDuelSalary <= lastPlayerSal);

                resultA = playerArr.sort((a, b) => {
                    return (b.FanDuelSalary - a.FanDuelSalary) || (b.FandDualProjection - a.FandDualProjection)
                })

                // console.log("resultA: ",resultA);
                let length = resultA.length - 1;
                // console.log("resultA: ",teamCount);
                for (let i = 0; i <= length;) {
                    let playerlength = 20;
                    let l = i;
                    let needvalue = 1;
                    // console.log("teamId: ", resultA[l].TeamID);
                    // console.log("result inside l: ",l,resultA[l].FanDuelSalary,resultA[l].Name,resultA[l].FandDualProjection,resultA[l].FanDualVal);
                    // if (resultA[l].DepthChartOrder == '0') {
                    // console.log("last player result Sallary l: ",resultA[l].FanDuelSalary,resultA[l].Name,resultA[l].FanDualVal);

                    if (teamArr.filter(item => item.PlayerId == resultA[l].PlayerID).length == 0
                        && lastPlayerSal >= resultA[l].FanDuelSalary
                        && resultA[l].FandDualProjection >= 3 && resultA[l].FanDualVal >= needvalue) {

                        if (teamArr.filter(el => el.TeamID == resultA[l].TeamID).length == 0) {
                            // console.log("resultA: 3");
                            teamArr.push({ PlayerId: resultA[l].PlayerID });
                            teamArr.push({ TeamID: resultA[l].TeamID, teamCount });
                        }
                        else {
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == resultA[l].TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                // console.log("resultA: 4");
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: resultA[l].PlayerID });
                            }
                            else {
                                // console.log("resultA: 5");
                                i++;
                                continue;
                            }
                        }

                        if (complete.filter(el => el.id == resultA[l].PlayerID).length == 0) {
                            // console.log("resultA: 1");
                            count = 1;
                            let playerDataWithCount = {
                                id: resultA[l].PlayerID,
                                TeamID: resultA[l].TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {
                            // console.log("resultA: 2");
                            let objIndex = complete.findIndex((obj => obj.id == resultA[l].PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }


                        // salary = salary - playerArr[l].DraftKingsSalary;
                        // console.log("teamArr: ",teamArr);
                        team[k] = resultA[l];
                        // console.log("in compare team: ", team);
                        i = length;

                        return 1;

                    }
                    else {
                        i++;
                        continue;
                    }
                    //}else{

                    //  l++;
                    // }
                }
            }

            // console.log("team: ", team);

            teamArray = [];

            let teamSalary = team.reduce((acc, item) => {
                // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                return acc + item.FanDuelSalary;
            }, 0);

            // console.log("team salary", teamSalary);
            // console.log("complete team dgsdgsdgfdshfsdddddddfdhgggggggdgdgsgsdgsdg", team.length);

            let getbuild = l * 30;
            if (j == getbuild) {
                //    // console.log(getbuild,"team",j,complete_team,teamcreate,reqsalary);
                if (complete_team > teamcreate) {
                    reqsalary = reqsalary;
                    teamcreate = complete_team;
                } else {
                    reqsalary = reqsalary - 500;
                    teamcreate = complete_team;
                }
                l = l + 1;
            }

            if (teamSalary <= 35000 && teamSalary >= reqsalary) {
                // console.log("aeraea team salary", teamSalary);
                // let fanteam = team.reverse();
                allTeams.push(team);

                let stringArray = allTeams.map(JSON.stringify);
                let uniqueStringArray = new Set(stringArray);
                allTeams = Array.from(uniqueStringArray, JSON.parse);

                complete_team = allTeams.length;

                for (const [key, value] of Object.entries(exposurePlayer)) {
                    // console.log(key, value);
                    // console.log(complete);
                    let newplayerCount = complete.find(item => item.id === key);
                    // console.log(value,newplayerCount);
                    if (newplayerCount)
                        if (value === newplayerCount.count) {
                            exposurePlayer[key] = 0;
                            delete exposurePlayer[key];
                        }
                }

            } else {

                for (const [key, value] of Object.entries(exposurePlayer)) {
                    // console.log(key, value);
                    exposurePlayer[key] = value + 1;
                }
                // console.log("Exposure players array: ", exposurePlayer);
            }
            // console.log("complete_team: ", complete_team);
            // console.log("get_builds: ", get_builds);
            if (complete_team == get_builds) {
                j = no_of_builds + 1;
            }
        }

        var totalteams = allTeams;
        // console.log("totalteams length", totalteams.length);
        const slatTeamData = {
            Teams: totalteams,
        }
        await SlatPlayers.updateOne({SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, slatTeamData, async (error, doc) => {
            if (error || !doc) {
                console.log("mlb DB error : Slat data update error");
            }
            else {
                console.log("mlb Teams data update");

                allTeams = allTeams.slice(-req.NumberOfBuild);

                let salaryArray = [];
                let projArray = [];
                for (let i = 0; i < allTeams.length; i++) {
                    let teamSalary = 0;
                    let teamProjection = 0;
                    for (let j = 0; j < allTeams[i].length; j++) {
                        // console.log("salary: ", allTeams[i][j].DraftKingsSalary);
                        teamSalary = teamSalary + allTeams[i][j].FanDuelSalary;
                        teamProjection = teamProjection + allTeams[i][j].FandDualProjection;
                    }
                    // console.log("teamProjection",teamProjection);
                    salaryArray[i] = teamSalary;
                    var ProjectionArray = {};
                    Object.assign(ProjectionArray, { teamnumber: i, teamvalue: teamProjection });
                    projArray.push(ProjectionArray);
                }

                let stringArray = allTeams.map(JSON.stringify);
                let uniqueStringArray = new Set(stringArray);
                allTeams = Array.from(uniqueStringArray, JSON.parse);

                let arrangeTeams = [];
                // let positions = ["QB","WR1","WR2","RB1","RB2","WR3","TE","FLEX","DST"];

                for (let i = 0; i < allTeams.length; i++) {
                    let team = [];
                    for (let j = 0; j < allTeams[i].length; j++) {
                        //    // console.log("i",i,"j: ", j,"newPos",newPos[j]);
                        team[j] = allTeams[i][newPos[j]];
                    }
                    arrangeTeams.push(team);
                }

                // console.log("arrangeTeams",arrangeTeams);
                allTeams = arrangeTeams;

                projArray = projArray.sort((a, b) => b.teamvalue - a.teamvalue);

                let projectarrangeTeams = [];
                let projectposition = [];
                for (let i = 0; i < projArray.length; i++) {
                    projectposition.push(projArray[i].teamnumber);
                }

                // console.log("projectposition",projectposition);

                for (let i = 0; i < allTeams.length; i++) {
                    // console.log(projectposition[i]);
                    let newteam = allTeams[projectposition[i]];
                    projectarrangeTeams.push(newteam);
                }

                allTeams = projectarrangeTeams;

                var senddata = {
                    "status": 0,
                    "success": true,
                    "allTeams": allTeams,
                    "salaryArray": salaryArray,
                    "delay": 1000
                }
                // socket.emit('mlbcreatebuild-success', allTeams,WR_Players,QB_Players,RB_Players,TE_Players,FLEX_Players,DST_Players);
                socket.emit('mlbcreatebuild-success', senddata);


                // console.log("allTeams: ", allTeams);
                // res.send({ status: 0, allTeams, salaryArray });
                // res.send({ PG_Players, SG_Players, PF_Players, SF_Players, G_Players, F_Players, UTIL_Players});  

                //     }
                // })
            }
        })


    }
    catch (error) {

        console.log(error);
        var response = {
            status: 1, success: false, messages: "something went wrong"
        }
        socket.emit('mlbcreatebuild-success', response);
        // console.log(error);
        // res.send({ error, status: 1, success: false, messages: "something went wrong" });
    }
}



module.exports.socket_create_build_single = async function (io, socket, req) {
    try {

        let CPT_Players = [];
        let UTIL_Players = [];
        let complete = [];
        let allTeams = [];
        let teamArray = [];
        var currentdate = moment().tz("America/New_York").format('YYYY-MM-DDT00:00:00');

        let no_of_builds = 500;
        let get_builds = req.NumberOfBuild;
        // let get_builds = 5;
        let positions = ["CPT", "UTIL", "UTIL", "UTIL", "UTIL4", "UTIL5"];
        let singlepositions = ["CPT", "UTIL"];
        // let positions = ["G"];
        let SlateID = req.SlateID;
        let user = req.user;
        let operator = req.operator;
        let gametype = req.gametype;
        // console.log("user: ", user);
        // console.log("SlateID: ", SlateID);
        // console.log("NumberOfBuild: ", get_builds);  
        // let user = "603f1f85e9539b7d08bc7ed4";
        // let SlateID = 12283; 
        let actioncount = 0;

        const lockplayer = await PlayerExposure.find({ slatId: SlateID, user: user, type: "lock" });
        // console.log("lockplayer",lockplayer.length);
        if (lockplayer.length > 0) {
            actioncount = actioncount + lockplayer.length;
        }
        const excludeplayer = await PlayerExposure.find({ slatId: SlateID, user: user, type: "exclude" });
        // console.log("excludeplayer",excludeplayer.length);
        if (excludeplayer.length > 0) {
            actioncount = actioncount + excludeplayer.length;
        }
        const manualplayer = await PlayerExposure.find({ slatId: SlateID, user: user, type: "manual" });
        // console.log("manualplayer",manualplayer.length);
        if (manualplayer.length > 0) {
            actioncount = actioncount + manualplayer.length;
        }
        const stackplayer = await PlayerPerTeam.find({ slatId: SlateID, user: user });
        // console.log("stackplayer",stackplayer.length);
        if (stackplayer.length > 0) {
            let teamStack = stackplayer[0].teamStack;
            let teamStack_length = teamStack.length;
            for (let i = 0; i < teamStack_length; i++) {
                // console.log("TEams ", teamStack[i].teamId);
                if (teamStack[i].minNoOfPlayer > 0) {
                    actioncount = actioncount + teamStack[i].minNoOfPlayer;

                }
            }
        }
        // if(stackplayer.length > 0){
        //  actioncount = actioncount + 1;
        // }
        const projectionplayer = await PlayerProjection.find({ slatId: SlateID, user: user });
        // console.log("projectionplayer",projectionplayer.length);
        if (projectionplayer.length > 0) {
            actioncount = actioncount + projectionplayer.length;
        }

        await PlayerExposure.find({ slatId: SlateID, user: user, type: "lock" })
            .then(async lockplayers => {
                await PlayerExposure.distinct("slatePlayerID", { slatId: SlateID, user: user, type: "exclude" })
                    .then(async exposureplayers => {
                        if (actioncount < 2) {

                            // return res.send({ status: 2, success: false, messages: "Please lock atleast one player" });
                            var response = {
                                status: 2, success: false, messages: "Please lock atleast one player"
                            }
                            socket.emit('mlbcreatebuild-success', response);
                        } else {

                            for (let k = 0; k < singlepositions.length; k++) {
                                let position = singlepositions[k];
                                // let count =0;
                                // console.log("position: ", position, " k: ", k);
                                await Slats.aggregate([{ "$match": { "SlateID": SlateID } },
                                { "$unwind": "$PlayerId" }, { "$unwind": "$PlayerId.OperatorRosterSlots" },
                                { "$match": { "PlayerId.OperatorRosterSlots": position } },
                                { "$project": { "PlayerId": "$PlayerId", "_id": 0 } }
                                ])
                                    .then(async result => {
                                        // console.log("resultlength: ", result.length);, Day: { $eq: currentdate } 
                                        for (let i = 0; i < result.length; i++) {
                                            await PlayerStats.findOne({ PlayerID: result[i].PlayerId.PlayerID, SportId: 2 },
                                                {
                                                    SportType: 1, SportId: 1, PlayerID: 1, DepthChartOrder: 1,
                                                    DepthChartPosition: 1, DraftKingsName: 1, Name: 1, InjuryStatus: 1,
                                                    InjuryStartDate: 1, InjuryBodyPart: 1, InjuryNotes: 1, DraftKingsProjection: 1,
                                                    DraftKingsPosition: 1, HomeOrAway: 1, FandDualProjection: 1, FPPDdraftking: 1, FPPDfanduel: 1,
                                                    PhotoUrl: 1, Status: 1, TeamID: 1, FPPG: 1, FanDuelPosition: 1,
                                                    DraftKingsVal: 1, FanDualVal: 1, Games: 1, FantasyPoints: 1, Team: 1, SlatePlayerID: 1, _id: 0
                                                })
                                                .then(async doc => {
                                                    // console.log("position: ", position);
                                                    if (doc) {

                                                        let logo = await PlayerProjection.findOne({ playerId: doc.PlayerID, slatId: req.SlateID, user: req.user }, { projection: 1 });
                                                        // console.log("logo",logo);
                                                        if (logo != null) {
                                                            // console.log("logo",logo);
                                                            // console.log("logo",logo.projection);
                                                            // player = player.toJSON();
                                                            doc.DraftKingsProjection = logo.projection;
                                                            doc.FandDualProjection = logo.projection;
                                                        }

                                                        // doc.set(SlatePlayerID, result[i].PlayerId.OperatorSlatePlayerID);
                                                        if (doc !== null && position === "CPT") {
                                                            if (doc.InjuryStatus !== "Out") {
                                                                if (result[i].PlayerId.OperatorSlatePlayerID != "") {
                                                                    doc["SlatePlayerID"] = result[i].PlayerId.OperatorSlatePlayerID;
                                                                }
                                                                doc["DraftKingsSalary"] = result[i].PlayerId.OperatorSalary1;
                                                                doc["FanDuelSalary"] = result[i].PlayerId.OperatorSalary1;
                                                                // console.log("doc: ", doc);
                                                                var indexof = exposureplayers.indexOf(doc.SlatePlayerID);

                                                                if (indexof == -1) {

                                                                    CPT_Players.push(doc);
                                                                }
                                                            }
                                                        }
                                                        if (doc !== null && position === "UTIL") {
                                                            if (doc.InjuryStatus !== "Out") {
                                                                if (result[i].PlayerId.OperatorSlatePlayerID != "") {
                                                                    doc["SlatePlayerID"] = result[i].PlayerId.OperatorSlatePlayerID;
                                                                }
                                                                doc["DraftKingsSalary"] = result[i].PlayerId.OperatorSalary1;
                                                                doc["FanDuelSalary"] = result[i].PlayerId.OperatorSalary1;
                                                                // console.log("doc: ", doc);
                                                                var indexof = exposureplayers.indexOf(doc.SlatePlayerID);

                                                                if (indexof == -1) {

                                                                    UTIL_Players.push(doc);
                                                                }
                                                            }
                                                        }
                                                    }
                                                })
                                        }
                                    })
                                    .catch(error => {
                                        // console.log("error: ", error);
                                        res.send({ error });
                                    })
                            }

                            // let Lockeduserteam = 
                            //     { 
                            //         19:2,
                            //         27:2
                            //     };

                            let LockedTeams = {};

                            await PlayerPerTeam.find({ slatId: SlateID, user: user })
                                .then(async teams => {
                                    // console.log("TEams ", teams);
                                    let teamStack = teams[0].teamStack;
                                    let teamStack_length = teamStack.length;
                                    for (let i = 0; i < teamStack_length; i++) {
                                        // console.log("TEams ", teamStack[i].teamId);
                                        if (teamStack[i].minNoOfPlayer > 0) {
                                            LockedTeams[teamStack[i].teamId] = teamStack[i].minNoOfPlayer;
                                        }
                                    }

                                })
                                .catch(error => {
                                    // console.log("player per team error");
                                })

                            // console.log("Player Per Team Lockeduserteam: ", Lockeduserteam);
                            // console.log("Player Per Team: ", LockedTeams);

                            let excludePlayers = [];
                            await PlayerExposure.find({ slatId: SlateID, user: user, type: "exclude" })
                                .then(async players => {
                                    let exclude_length = players.length;
                                    for (let i = 0; i < exclude_length; i++) {
                                        await PlayerStats.findOne({ PlayerID: players[i].playerId },
                                            {
                                                SportType: 1, SportId: 1, PlayerID: 1, DepthChartOrder: 1,
                                                DepthChartPosition: 1, DraftKingsName: 1, Name: 1, InjuryStatus: 1,
                                                InjuryStartDate: 1, InjuryBodyPart: 1, InjuryNotes: 1, DraftKingsProjection: 1,
                                                DraftKingsPosition: 1, HomeOrAway: 1, FandDualProjection: 1, FPPDdraftking: 1, FPPDfanduel: 1,
                                                PhotoUrl: 1, Status: 1, TeamID: 1, FPPG: 1, FanDuelPosition: 1,
                                                DraftKingsVal: 1, FanDualVal: 1, Games: 1, FantasyPoints: 1, Team: 1, SlatePlayerID: 1, _id: 0
                                            })
                                            .then(async doc => {
                                                if (players[i].slatePlayerID != "") {
                                                    doc["SlatePlayerID"] = players[i].slatePlayerID;
                                                }

                                                let logo = await PlayerProjection.findOne({ playerId: doc.PlayerID, slatId: req.SlateID, user: req.user }, { projection: 1 });
                                                // console.log("logo",logo);
                                                if (logo != null) {
                                                    // console.log("logo",logo);
                                                    // console.log("logo",logo.projection);
                                                    // player = player.toJSON();
                                                    doc.DraftKingsProjection = logo.projection;
                                                    doc.FandDualProjection = logo.projection;
                                                }

                                                doc["DraftKingsSalary"] = players[i].sallary;
                                                doc["FanDuelSalary"] = players[i].sallary;

                                                excludePlayers.push(doc);

                                            })
                                    }


                                })
                                .catch(error => {
                                    // console.log("exclude data find error");
                                })

                            // console.log("exclude players array: ", excludePlayers);

                            let lockedPlayers = [];
                            let exposurePlayer = {};
                            await PlayerExposure.find({ slatId: SlateID, user: user, type: { $ne: "exclude" } })
                                .then(async players => {
                                    let exclude_length = players.length;
                                    // console.log("exclude locked length",exclude_length);
                                    for (let i = 0; i < exclude_length; i++) {

                                        if (players[i].type == "lock") {

                                            exposurePlayer[players[i].playerId] = 500;

                                        } else {

                                            var totalper = 0;
                                            if (players[i].min > players[i].max) {
                                                totalper = players[i].min;
                                            } else {
                                                totalper = players[i].max;
                                            }

                                            // console.log("totalper",players[i].playerId,totalper);

                                            let inlineup = Math.round(Math.abs(totalper / 10));
                                            inlineup = (inlineup * get_builds) / 10;
                                            exposurePlayer[players[i].playerId] = Math.round(inlineup);
                                        }



                                        // exposurePlayer.push(inlineCount);
                                        await PlayerStats.findOne({ PlayerID: players[i].playerId },
                                            {
                                                SportType: 1, SportId: 1, PlayerID: 1, DepthChartOrder: 1,
                                                DepthChartPosition: 1, DraftKingsName: 1, Name: 1, InjuryStatus: 1,
                                                InjuryStartDate: 1, InjuryBodyPart: 1, InjuryNotes: 1, DraftKingsProjection: 1,
                                                DraftKingsPosition: 1, HomeOrAway: 1, FandDualProjection: 1, FPPDdraftking: 1, FPPDfanduel: 1,
                                                PhotoUrl: 1, Status: 1, TeamID: 1, FPPG: 1, FanDuelPosition: 1,
                                                DraftKingsVal: 1, FanDualVal: 1, Games: 1, FantasyPoints: 1, Team: 1, SlatePlayerID: 1, _id: 0
                                            })
                                            .then(async doc => {
                                                if (players[i].slatePlayerID != "") {
                                                    doc["SlatePlayerID"] = players[i].slatePlayerID;
                                                }

                                                let logo = await PlayerProjection.findOne({ playerId: doc.PlayerID, slatId: req.SlateID, user: req.user }, { projection: 1 });
                                                // console.log("logo",logo);
                                                if (logo != null) {
                                                    // console.log("logo",logo);
                                                    // console.log("logo",logo.projection);
                                                    // player = player.toJSON();
                                                    doc.DraftKingsProjection = logo.projection;
                                                    doc.FandDualProjection = logo.projection;
                                                }

                                                doc["DraftKingsSalary"] = players[i].sallary;
                                                doc["FanDuelSalary"] = players[i].sallary;


                                                lockedPlayers.push(doc);

                                            })
                                    }


                                })
                                .catch(error => {
                                    // console.log("exclude locked data find error");
                                })


                            let playerByPosition = {};
                            let isLineUpCreated = await SlatPlayers.findOne({ SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, { SportId: 1 });
                            console.log("logo", isLineUpCreated);

                            playerByPosition.CPT = CPT_Players;
                            playerByPosition.UTIL = UTIL_Players;
                            playerByPosition.Lock = lockedPlayers;
                            playerByPosition.Exclude = excludePlayers;
                            playerByPosition.Exposure = exposurePlayer;

                            if (isLineUpCreated != null) {

                                const slatPlayerData = {
                                    Players: playerByPosition,
                                }
                                await SlatPlayers.update({SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, slatPlayerData, (error, doc) => {
                                    if (error || !doc) {
                                        console.log("mlb DB error : Slat data update error");
                                    }
                                    else {
                                        console.log("mlb Player data update");
                                    }
                                })
                            } else {
                                const slatPlayerData = new SlatPlayers({
                                    SportType: "MLB",
                                    SportId: "2",
                                    SlatID: req.SlateID,
                                    UserId: req.user,
                                    Players: playerByPosition,

                                })
                                await slatPlayerData.save((error, doc) => {
                                    if (error || !doc) {
                                        console.log(error);
                                    }
                                    else {
                                        console.log("mlb mlb player data added");
                                    }
                                });
                            }

                            // console.log("Locked players array: ", lockedPlayers);
                            // console.log("Exposure players array: ", exposurePlayer);
                            // console.log("cpt", CPT_Players);

                            // res.send(lockedPlayers,CPT_Players);

                            let complete_team = 0;
                            let count = 0;
                            let reqsalary = 49000;
                            let teamcreate = 0;
                            let l = 1;
                            for (let j = 0; j <= no_of_builds; j++) {
                                let team = [];
                                let teamCount = 1;
                                // let complete_team = 0;
                                let salary = 50000;
                                for (let k = 0; k < positions.length; k++) {
                                    let position = positions[k];
                                    // console.log("position: ", position, " k: ", k, "j:", j);
                                    // let count =0;
                                    if (position === "CPT") {
                                        CPT_Players = CPT_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                            .includes(JSON.stringify(elm)));

                                        // PG_Players = PG_Players.filter(val => !excludePlayers.includes(val));

                                        CPT_Players = CPT_Players.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection);
                                        });

                                        let length = lockedPlayers.length;
                                        let sucess = 0;
                                        let playerCount = {};
                                        let playerdet = {};
                                        for (let i = 0; i < length;) {
                                            if (CPT_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                                // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);

                                                playerdet = CPT_Players.find(item => item.PlayerID === lockedPlayers[i].PlayerID);
                                                // console.log("Sallary",playerdet.DraftKingsSalary);

                                                if (playerdet.DraftKingsSalary === lockedPlayers[i].DraftKingsSalary) {
                                                    // console.log("yes sallary",lockedPlayers[i].DraftKingsSalary);
                                                    // console.log("yes ID",lockedPlayers[i].PlayerID);


                                                    let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                                    if (j != 0) {
                                                        playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                                        if (!playerCount) {
                                                            playerCount = 0;
                                                        }
                                                        // console.log("Count",playerCount);
                                                        // console.log("onlyCount",playerCount.count);
                                                        if (playerCount.count < playerexpo) {
                                                            // console.log("enter");
                                                            sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                            i = length;
                                                            continue;
                                                        } else {
                                                            // console.log("not enter");
                                                            // sucess =  firstPLayer(teamArray, PG_Players, team, k, LockedTeams, position);
                                                            // i = length;
                                                            i++;
                                                            continue;

                                                        }

                                                    } else {
                                                        // console.log("nlockfirst");
                                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                        i = length;
                                                        continue;
                                                    }

                                                } else {
                                                    // console.log("no");
                                                    i++;
                                                    continue;
                                                }
                                            }
                                            else {
                                                // console.log("no");
                                                i++;
                                            }
                                        }

                                        // console.log("sucess",sucess);

                                        if (sucess == 0) {
                                            // console.log("PG_sucessPlayers");
                                            // console.log("PG_Players",PG_Players);
                                            sucess = firstPLayer(teamArray, CPT_Players, team, k, LockedTeams, position, lockedPlayers);
                                        }

                                        // console.log("sucess",sucess);

                                    }

                                    if (position === "UTIL") {
                                        UTIL_Players = UTIL_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                            .includes(JSON.stringify(elm)));

                                        // UTIL_Players = UTIL_Players.filter(val => !excludePlayers.includes(val));

                                        // console.log("in util");
                                        UTIL_Players = UTIL_Players.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection);
                                        });

                                        let teamSalary = team.reduce((acc, item) => {
                                            // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                            return acc + item.DraftKingsSalary;
                                        }, 0);

                                        let remainingplayer = positions.length - k;
                                        // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                                        let lastPlayerSal = (Math.abs(50000 - teamSalary) / remainingplayer);

                                        // console.log("last player sal: ", lastPlayerSal);
                                        // console.log("last team sal in util: ", teamSalary);

                                        let length = lockedPlayers.length;
                                        let sucess = 0;
                                        let playerdet = {};
                                        let playerCount = {};
                                        for (let i = 0; i < length;) {
                                            if (UTIL_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                                // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                                                playerdet = UTIL_Players.find(item => item.PlayerID === lockedPlayers[i].PlayerID);
                                                // console.log("Sallary",playerdet.DraftKingsSalary);

                                                if (playerdet.DraftKingsSalary === lockedPlayers[i].DraftKingsSalary) {

                                                    let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                                    if (j != 0) {
                                                        playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                                        if (!playerCount) {
                                                            playerCount = 0;
                                                        }
                                                        // console.log("Count",playerCount);
                                                        // console.log("onlyCount",playerCount.count);
                                                        if (playerCount.count < playerexpo) {
                                                            // console.log("enter");
                                                            sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                            i = length;
                                                            continue;
                                                        } else {
                                                            // console.log("not enter");

                                                            i++;
                                                            continue;

                                                        }

                                                    } else {
                                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                        i = length;
                                                        continue;
                                                    }
                                                }
                                                else {
                                                    // console.log("no");
                                                    i++;
                                                    continue;
                                                }
                                            }
                                            else {
                                                // console.log("no");
                                                i++;
                                            }
                                        }

                                        // console.log("sucess1",sucess);

                                        if (sucess == 0) {
                                            // console.log("UTIL_sucessPlayers");
                                            // if (lastPlayerSal > 6000) {
                                            //     sucess = lastPlayer(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            // }
                                            // else {
                                            sucess = addtolineup(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            // }
                                        }

                                        // console.log("sucess",sucess);


                                    }

                                    if (position === "UTIL4") {
                                        UTIL_Players = UTIL_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                            .includes(JSON.stringify(elm)));

                                        // UTIL_Players = UTIL_Players.filter(val => !excludePlayers.includes(val));

                                        // console.log("in util");
                                        UTIL_Players = UTIL_Players.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection);
                                        });

                                        let teamSalary = team.reduce((acc, item) => {
                                            // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                            return acc + item.DraftKingsSalary;
                                        }, 0);

                                        let remainingplayer = positions.length - k;
                                        // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                                        let lastPlayerSal = (Math.abs(50000 - teamSalary) / remainingplayer);

                                        // console.log("last player sal: ", lastPlayerSal);
                                        // console.log("last team sal in util: ", teamSalary);

                                        let length = lockedPlayers.length;
                                        let sucess = 0;
                                        let playerdet = {};
                                        let playerCount = {};
                                        for (let i = 0; i < length;) {
                                            if (UTIL_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                                // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                                                playerdet = UTIL_Players.find(item => item.PlayerID === lockedPlayers[i].PlayerID);
                                                // console.log("Sallary",playerdet.DraftKingsSalary);

                                                if (playerdet.DraftKingsSalary === lockedPlayers[i].DraftKingsSalary) {

                                                    let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                                    if (j != 0) {
                                                        playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                                        if (!playerCount) {
                                                            playerCount = 0;
                                                        }
                                                        // console.log("Count",playerCount);
                                                        // console.log("onlyCount",playerCount.count);
                                                        if (playerCount.count < playerexpo) {
                                                            // console.log("enter");
                                                            sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                            i = length;
                                                            continue;
                                                        } else {
                                                            // console.log("not enter");

                                                            i++;
                                                            continue;

                                                        }

                                                    } else {
                                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                        i = length;
                                                        continue;
                                                    }
                                                }
                                                else {
                                                    // console.log("no");
                                                    i++;
                                                    continue;
                                                }
                                            }
                                            else {
                                                // console.log("no");
                                                i++;
                                            }
                                        }

                                        // console.log("sucess1",sucess);

                                        if (sucess == 0) {
                                            // console.log("UTIL_sucessPlayers");
                                            if (lastPlayerSal > 6000) {
                                                sucess = lastPlayer(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            }
                                            else {
                                                sucess = addtolineup(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            }
                                        }

                                        // console.log("sucess",sucess);


                                    }

                                    if (position === "UTIL5") {
                                        UTIL_Players = UTIL_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                            .includes(JSON.stringify(elm)));

                                        // UTIL_Players = UTIL_Players.filter(val => !excludePlayers.includes(val));

                                        // console.log("in util");
                                        UTIL_Players = UTIL_Players.sort((a, b) => {
                                            return (b.DraftKingsProjection - a.DraftKingsProjection);
                                        });
                                        let teamSalary = team.reduce((acc, item) => {
                                            // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                            return acc + item.DraftKingsSalary;
                                        }, 0);
                                        let lastPlayerSal = Math.abs(50000 - teamSalary);
                                        // console.log("last player sal: ", lastPlayerSal);
                                        // console.log("last team sal in util: ", teamSalary);

                                        let length = lockedPlayers.length;
                                        let sucess = 0;
                                        let playerdet = {};
                                        let playerCount = {};
                                        for (let i = 0; i < length;) {
                                            if (UTIL_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                                // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);

                                                // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                                                playerdet = UTIL_Players.find(item => item.PlayerID === lockedPlayers[i].PlayerID);
                                                if (!playerCount) {
                                                    playerCount = 0;
                                                }
                                                // console.log("Sallary",playerdet.DraftKingsSalary);

                                                if (playerdet.DraftKingsSalary === lockedPlayers[i].DraftKingsSalary) {

                                                    let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                                    if (j != 0) {
                                                        playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                                        // console.log("Count",playerCount);
                                                        // console.log("onlyCount",playerCount.count);
                                                        if (playerCount.count < playerexpo) {
                                                            // console.log("enter");
                                                            sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                            i = length;
                                                            continue;
                                                        } else {
                                                            // console.log("not enter");

                                                            i++;
                                                            continue;

                                                        }

                                                    } else {
                                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                        i = length;
                                                        continue;
                                                    }
                                                }
                                                else {
                                                    // console.log("no");
                                                    i++;
                                                    continue;
                                                }
                                            }
                                            else {
                                                // console.log("no");
                                                i++;
                                            }
                                        }

                                        // console.log("sucess1",sucess);

                                        if (sucess == 0) {
                                            // console.log("UTIL_sucessPlayers");
                                            if (lastPlayerSal > 6000) {
                                                sucess = lastPlayer(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            }
                                            else {
                                                sucess = randomplayer(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                                            }
                                        }

                                        // console.log("sucess2",sucess);

                                        if (sucess == null) {
                                            sucess = randomplayer(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                                        }

                                        // console.log("sucess",sucess);


                                    }
                                }

                                function includelockPLayer(teamArr, playerArr, team, k, position) {

                                    // console.log("lock");
                                    if (teamArr.filter(el => el.TeamID == playerArr.TeamID).length == 0) {
                                        // console.log("Before update: 3");
                                        teamArr.push({ PlayerId: playerArr.PlayerID });
                                        teamArr.push({ TeamID: playerArr.TeamID, teamCount });
                                    }
                                    else {
                                        // console.log("Before update: 4");
                                        let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr.TeamID));
                                        if (teamArr[objIndex].teamCount < 4) {
                                            // console.log("Before update: 5");
                                            teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                            teamArr.push({ PlayerId: playerArr.PlayerID });
                                        }
                                        else {
                                            // console.log("Before update: 6");
                                            return 0;
                                        }
                                    }

                                    if (complete.filter(el => el.id == playerArr.PlayerID).length == 0) {
                                        // console.log("Before update: 1");
                                        count = 1;
                                        let playerDataWithCount = {
                                            id: playerArr.PlayerID,
                                            TeamID: playerArr.TeamID,
                                            count: count
                                        }
                                        complete.push(playerDataWithCount);
                                    }
                                    else {

                                        // console.log("Before update: 2");
                                        let objIndex = complete.findIndex((obj => obj.id == playerArr.PlayerID));
                                        // console.log("Before update: ", complete[objIndex]);
                                        complete[objIndex].count = complete[objIndex].count + 1;
                                    }

                                    team[k] = playerArr;
                                    return 1;
                                }

                                function firstPLayer(teamArr, AllplayerArr, team, k, LockedTeams, position, lockedPlayers) {

                                    // console.log("lockedTeams: ", LockedTeams);
                                    // console.log("PlayerArray: ", teamArr); 
                                    let playerArr = [];

                                    if (LockedTeams) {
                                        // array exists and is not empty
                                        // console.log("lockedTeams: Last ", LockedTeams['9']);

                                        for (const [key, value] of Object.entries(LockedTeams)) {
                                            // console.log(key , value);
                                            if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                                                // console.log("yes:",);
                                                let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                                                // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                                                if (value > teamArr[objIndex].teamCount) {
                                                    // console.log("Teamid",key); 
                                                    // filter lock teams
                                                    let array1 = AllplayerArr.filter(obj => {

                                                        // console.log("array :1 ", obj.TeamID); 
                                                        return obj.TeamID == key
                                                    });
                                                    array1 = Object.assign(array1);
                                                    playerArr = playerArr.concat(array1);
                                                    // playerArr.push(array1);
                                                }
                                            } else {
                                                // console.log("Teamid",key); 
                                                let array1 = AllplayerArr.filter(obj => {

                                                    // console.log("array :1 ", obj.TeamID); 
                                                    return obj.TeamID == key
                                                });
                                                array1 = Object.assign(array1);
                                                playerArr = playerArr.concat(array1);
                                                // playerArr.push(array1);

                                            }

                                        }
                                    }


                                    // console.log("arrayfinal ", playerArr.length);

                                    if (playerArr.length == 0) {
                                        playerArr = AllplayerArr;
                                    }

                                    // console.log("arrayfinal ", playerArr.length);

                                    playerArr = playerArr.sort((a, b) => {
                                        return (b.DraftKingsProjection - a.DraftKingsProjection)
                                    })

                                    let length = playerArr.length - 1;
                                    for (let i = 0; i < length;) {
                                        let n = Math.floor(Math.random() * Math.floor(4));
                                        // console.log("teamId: ", n,playerArr[n].DraftKingsSalary);
                                        let lockutil = 0;
                                        if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0 && playerArr[n].DraftKingsProjection > 3) {

                                            for (let l = 0; l < lockedPlayers.length;) {
                                                if (playerArr[n].PlayerID === lockedPlayers[l].PlayerID) {
                                                    l = lockedPlayers.length;
                                                    lockutil = 1;
                                                } else {
                                                    l++;
                                                }
                                            }

                                            if (lockutil === 1) {
                                                i++;
                                                continue;
                                            }

                                            if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                            }
                                            else {
                                                let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                                if (teamArr[objIndex].teamCount < 4) {
                                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                }
                                                else {
                                                    i++;
                                                    continue;
                                                }
                                            }

                                            if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                                count = 1;
                                                let playerDataWithCount = {
                                                    id: playerArr[n].PlayerID,
                                                    TeamID: playerArr[n].TeamID,
                                                    count: count
                                                }
                                                complete.push(playerDataWithCount);
                                            }
                                            else {
                                                let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                                // console.log("Before update: ", complete[objIndex]);
                                                complete[objIndex].count = complete[objIndex].count + 1;
                                            }

                                            salary = salary - playerArr[n].DraftKingsSalary;
                                            team[k] = playerArr[n];
                                            i = length;
                                            // console.log("in compare team: ", team);
                                            return 1;
                                        }
                                        else {
                                            i++;
                                        }
                                    }
                                }

                                function addtolineup(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position) {

                                    // console.log("lockedTeams: add to line up", LockedTeams);
                                    // console.log("PlayerArray: ", teamArr); 
                                    // console.log("Add to line up: ");

                                    let playerArr = [];

                                    if (LockedTeams) {
                                        // array exists and is not empty
                                        // console.log("lockedTeams: Last ", LockedTeams['9']);

                                        for (const [key, value] of Object.entries(LockedTeams)) {
                                            // console.log(key , value);
                                            // console.log("teamArr.length: ", teamArr.length); 
                                            // console.log("teamArr.filter(el => el.TeamID == key).length: ", teamArr.filter(el => el.TeamID == key).length); 
                                            if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                                                // console.log("yes:1",);
                                                let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                                                // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                                                if (value > teamArr[objIndex].teamCount) {
                                                    // console.log("Teenter",key); 
                                                    // filter lock teams
                                                    let array1 = AllplayerArr.filter(obj => {

                                                        // console.log("array :1 ", obj.TeamID); 
                                                        return obj.TeamID == key
                                                    });

                                                    array1 = Object.assign(array1);
                                                    playerArr = playerArr.concat(array1);
                                                    // playerArr.push(array1);
                                                }
                                            } else {
                                                // console.log("yes:2",);
                                                // console.log("Teamid",key); 
                                                let array1 = AllplayerArr.filter(obj => {

                                                    // console.log("array :1 ", obj.TeamID); 
                                                    return obj.TeamID == key
                                                });
                                                array1 = Object.assign(array1);
                                                playerArr = playerArr.concat(array1);
                                                // playerArr.push(array1);

                                            }

                                        }
                                    }

                                    // console.log("arrayfinal before", playerArr.length);

                                    if (playerArr.length == 0) {
                                        playerArr = AllplayerArr;
                                    }

                                    // console.log("arrayfinal ", playerArr.length);

                                    let addlastPlayerSal = lastPlayerSal - 2000;
                                    let endlastPlayerSal = lastPlayerSal + 4000;

                                    let length = playerArr.length + 30;
                                    let playerlength = playerArr.length - 1;
                                    for (let i = 0; i < length;) {

                                        let n = Math.floor(Math.random() * Math.floor(playerlength));
                                        // console.log("teamId: ", playerArr[n].TeamID);
                                        // console.log("position: ", n,playerArr[n].DraftKingsSalary);
                                        // console.log("salary: ", playerArr[n].DraftKingsSalary);
                                        if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                                            && endlastPlayerSal >= playerArr[n].DraftKingsSalary
                                            && addlastPlayerSal <= playerArr[n].DraftKingsSalary && playerArr[n].DraftKingsProjection > 3) {
                                            // console.log("position: enter3 ");
                                            if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                                // console.log("position: 3 ");
                                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                            }
                                            else {
                                                let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                                if (teamArr[objIndex].teamCount < 4) {
                                                    // console.log("position: 4 ");
                                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                                }
                                                else {
                                                    // console.log("position: 5 ");
                                                    i++;
                                                    continue;
                                                }
                                            }

                                            if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                                // console.log("position: 1 ");
                                                count = 1;
                                                let playerDataWithCount = {
                                                    id: playerArr[n].PlayerID,
                                                    TeamID: playerArr[n].TeamID,
                                                    count: count
                                                }
                                                complete.push(playerDataWithCount);
                                            }
                                            else {
                                                // console.log("position: 2 ");
                                                let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                                // console.log("Before update: ", complete[objIndex]);
                                                complete[objIndex].count = complete[objIndex].count + 1;
                                            }


                                            // salary = salary - playerArr[n].DraftKingsSalary;
                                            team[k] = playerArr[n];
                                            i = length;
                                            // console.log("in compare team: ", team);
                                            return 1;
                                        }
                                        else {
                                            i++;
                                        }
                                    }
                                }

                                function randomplayer(teamArr, playerArr, team, k, LockedTeams, lastPlayerSal, position) {

                                    // console.log("Random: ");
                                    let addlastPlayerSal = 3000;

                                    resultA = playerArr.sort((a, b) => {
                                        return (b.DraftKingsProjection - a.DraftKingsProjection)
                                    })

                                    let length = playerArr.length - 1;
                                    for (let i = 0; i < length;) {
                                        // let n = Math.floor(Math.random() * Math.floor(length));
                                        // console.log("teamId: ", playerArr[n].TeamID);
                                        // console.log("position: ", n);
                                        // console.log("salary: ", playerArr[i].DraftKingsSalary);
                                        if (teamArr.filter(item => item.PlayerId == playerArr[i].PlayerID).length == 0
                                            && addlastPlayerSal <= playerArr[i].DraftKingsSalary && playerArr[i].DraftKingsProjection > 3) {
                                            // console.log("position: enter3 ");
                                            if (teamArr.filter(el => el.TeamID == playerArr[i].TeamID).length == 0) {
                                                // console.log("position: 3 ");
                                                teamArr.push({ PlayerId: playerArr[i].PlayerID });
                                                teamArr.push({ TeamID: playerArr[i].TeamID, teamCount });
                                            }
                                            else {
                                                let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[i].TeamID));
                                                if (teamArr[objIndex].teamCount < 4) {
                                                    // console.log("position: 4 ");
                                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                                    teamArr.push({ PlayerId: playerArr[i].PlayerID });
                                                }
                                                else {
                                                    // console.log("position: 5 ");
                                                    i++;
                                                    continue;
                                                }
                                            }

                                            if (complete.filter(el => el.id == playerArr[i].PlayerID).length == 0) {
                                                // console.log("position: 1 ");
                                                count = 1;
                                                let playerDataWithCount = {
                                                    id: playerArr[i].PlayerID,
                                                    TeamID: playerArr[i].TeamID,
                                                    count: count
                                                }
                                                complete.push(playerDataWithCount);
                                            }
                                            else {
                                                // console.log("position: 2 ");
                                                let objIndex = complete.findIndex((obj => obj.id == playerArr[i].PlayerID));
                                                // console.log("Before update: ", complete[objIndex]);
                                                complete[objIndex].count = complete[objIndex].count + 1;
                                            }


                                            // salary = salary - playerArr[n].DraftKingsSalary;
                                            team[k] = playerArr[i];
                                            i = length;
                                            // console.log("in compare team: ", team);
                                            return 1;
                                        }
                                        else {
                                            i++;
                                        }
                                    }
                                }

                                function lastPlayer(teamArr, playerArr, team, k, LockedTeams, lastPlayerSal, position) {

                                    // console.log("last player");
                                    resultA = playerArr.sort((a, b) => {
                                        return (b.DraftKingsProjection - a.DraftKingsProjection)
                                    })
                                    // console.log("resultA: ",resultA);
                                    let length = resultA.length - 1;



                                    // console.log("resultA: ",length);
                                    for (let l = 0; l <= length;) {
                                        // console.log("teamId: ", resultA[l].TeamID);
                                        // console.log("result inside l: ",resultA[l]);
                                        // if (resultA[l].DepthChartOrder == '0') {
                                        // console.log("result Sallary l: ",resultA[l].DraftKingsSalary,resultA[l].DraftKingsProjection);

                                        if (teamArr.filter(item => item.PlayerId == resultA[l].PlayerID).length == 0
                                            && lastPlayerSal >= resultA[l].DraftKingsSalary && resultA[l].DraftKingsProjection > 3
                                        ) {
                                            // console.log("resultA: 6");
                                            if (teamArr.filter(el => el.TeamID == resultA[l].TeamID).length == 0) {
                                                // console.log("resultA: 3");
                                                teamArr.push({ PlayerId: resultA[l].PlayerID });
                                                teamArr.push({ TeamID: resultA[l].TeamID, teamCount });
                                            }
                                            else {
                                                let objIndex = teamArr.findIndex((obj => obj.TeamID == resultA[l].TeamID));
                                                if (teamArr[objIndex].teamCount < 4) {
                                                    // console.log("resultA: 4");
                                                    teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                                    teamArr.push({ PlayerId: resultA[l].PlayerID });
                                                }
                                                else {
                                                    // console.log("resultA: 5");
                                                    l++;
                                                    continue;
                                                }
                                            }

                                            if (complete.filter(el => el.id == resultA[l].PlayerID).length == 0) {
                                                // console.log("resultA: 1");
                                                count = 1;
                                                let playerDataWithCount = {
                                                    id: resultA[l].PlayerID,
                                                    TeamID: resultA[l].TeamID,
                                                    count: count
                                                }
                                                complete.push(playerDataWithCount);
                                            }
                                            else {
                                                // console.log("resultA: 2");
                                                let objIndex = complete.findIndex((obj => obj.id == resultA[l].PlayerID));
                                                // console.log("Before update: ", complete[objIndex]);
                                                complete[objIndex].count = complete[objIndex].count + 1;
                                            }


                                            // salary = salary - playerArr[l].DraftKingsSalary;
                                            // console.log("teamArr: ",teamArr);
                                            team[k] = resultA[l];
                                            // console.log("in compare team: ", team);
                                            l = length;

                                            return 1;

                                        }
                                        else {
                                            l++;
                                            continue;
                                        }
                                        // }else{

                                        //     l++;
                                        // }
                                    }
                                }



                                // console.log("team: ", team);
                                // console.log("complete: ",complete);
                                // console.log("teamarray: ", teamArray);
                                teamArray = [];

                                let teamSalary = team.reduce((acc, item) => {
                                    // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                    return acc + item.DraftKingsSalary;
                                }, 0);

                                // console.log("team salary", teamSalary);
                                // console.log("complete team dgsdgsdgfdshfsdddddddfdhgggggggdgdgsgsdgsdg", team.length);

                                let getbuild = l * 30;
                                if (j == getbuild) {
                                    //    // console.log(getbuild,"team",j,complete_team,teamcreate,reqsalary);
                                    if (complete_team > teamcreate) {
                                        reqsalary = reqsalary;
                                        teamcreate = complete_team;
                                    } else {
                                        reqsalary = reqsalary - 500;
                                        teamcreate = complete_team;
                                    }
                                    l = l + 1;
                                }

                                if (teamSalary <= 50000 && teamSalary >= reqsalary) {
                                    // console.log("aeraea team salary", teamSalary);
                                    allTeams.push(team);

                                    let stringArray = allTeams.map(JSON.stringify);
                                    let uniqueStringArray = new Set(stringArray);
                                    allTeams = Array.from(uniqueStringArray, JSON.parse);

                                    complete_team = allTeams.length;

                                    for (const [key, value] of Object.entries(exposurePlayer)) {
                                        // console.log(key, value);
                                        let newplayerCount = complete.find(item => item.id === key);
                                        if (newplayerCount)
                                            if (value === newplayerCount.count) {
                                                exposurePlayer[key] = 0;
                                                delete exposurePlayer[key];
                                            }
                                    }

                                } else {

                                    for (const [key, value] of Object.entries(exposurePlayer)) {
                                        // console.log(key, value);
                                        exposurePlayer[key] = value + 1;
                                    }
                                    // console.log("Exposure players array: ", exposurePlayer);
                                }
                                // console.log("complete_team: ", complete_team);
                                // console.log("get_builds: ", get_builds);
                                if (complete_team == get_builds) {
                                    j = no_of_builds + 1;
                                }
                            }

                            var totalteams = allTeams;



                            allTeams = allTeams.slice(-req.NumberOfBuild);

                            // console.log("allTeams: ", allTeams);
                            // let salaryArray = [];
                            // for (let i = 0; i < allTeams.length; i++) {
                            //     let teamSalary = 0;
                            //     for (let j = 0; j < allTeams[i].length; j++) {
                            //         // console.log("i",i,"j: ", j);
                            //         // console.log("salary: ", allTeams[i][j].DraftKingsSalary);
                            //         teamSalary = teamSalary + allTeams[i][j].DraftKingsSalary;
                            //     }
                            //     salaryArray[i] = teamSalary;
                            // }

                            // let stringArray = allTeams.map(JSON.stringify);
                            // let uniqueStringArray = new Set(stringArray);
                            // allTeams = Array.from(uniqueStringArray, JSON.parse);

                            let salaryArray = [];
                            let projArray = [];
                            for (let i = 0; i < allTeams.length; i++) {
                                let teamSalary = 0;
                                let teamProjection = 0;
                                for (let j = 0; j < allTeams[i].length; j++) {
                                    // console.log("salary: ", allTeams[i][j].DraftKingsSalary);
                                    teamSalary = teamSalary + allTeams[i][j].DraftKingsSalary;
                                    teamProjection = teamProjection + allTeams[i][j].DraftKingsProjection;
                                }
                                // console.log("teamProjection",teamProjection);
                                salaryArray[i] = teamSalary;
                                var ProjectionArray = {};
                                Object.assign(ProjectionArray, { teamnumber: i, teamvalue: teamProjection });
                                projArray.push(ProjectionArray);
                            }

                            let stringArray = allTeams.map(JSON.stringify);
                            let uniqueStringArray = new Set(stringArray);
                            allTeams = Array.from(uniqueStringArray, JSON.parse);

                            projArray = projArray.sort((a, b) => b.teamvalue - a.teamvalue);

                            let projectarrangeTeams = [];
                            let projectposition = [];
                            for (let i = 0; i < projArray.length; i++) {
                                projectposition.push(projArray[i].teamnumber);
                            }

                            // console.log("projectposition",projectposition);

                            for (let i = 0; i < allTeams.length; i++) {
                                // console.log(projectposition[i]);
                                let newteam = allTeams[projectposition[i]];
                                projectarrangeTeams.push(newteam);
                            }

                            allTeams = projectarrangeTeams;

                            var senddata = {
                                "status": 0,
                                "success": true,
                                "allTeams": allTeams,
                                "salaryArray": salaryArray,
                                "delay": 3000
                            }

                            const slatTeamData = {
                                Teams: totalteams,
                            }
                            await SlatPlayers.update({SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, slatTeamData, (error, doc) => {
                                if (error || !doc) {
                                    console.log("mlb DB error : Slat data update error");
                                }
                                else {
                                    console.log("mlb Teams data update");
                                    socket.emit('mlbcreatebuild-success', senddata);
                                }
                            })

                            // socket.emit('mlbcreatebuild-success', allTeams,WR_Players,QB_Players,RB_Players,TE_Players,FLEX_Players,DST_Players);
                            
                            // console.log("allTeams: ", allTeams);
                            // res.send({ status: 0, allTeams, salaryArray, B1_Players, B3_Players, OF_Players, B2_Players, SS_Players });
                            // res.send({ PG_Players, SG_Players, PF_Players, SF_Players, G_Players, F_Players, UTIL_Players});
                        }

                    })
            })
    }
    catch (error) {
        console.log(error);
        var response = {
            status: 1, success: false, messages: "something went wrong"
        }
        socket.emit('mlbcreatebuild-success', response);
        // res.send({ error, status: 1, success: false, messages: "something went wrong" });
    }
}

module.exports.nextsocket_create_build_single = async function (io, socket, req) {
    try {

        let istest = await SlatPlayers.findOne({SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, { Players: 1, Teams: 1 });
        console.log("istest", istest.Teams.length)
        var AllTypePlayers = istest.Players[0];
        var AllTypeTeams = istest.Teams;

        let CPT_Players = AllTypePlayers.CPT;
        let UTIL_Players = AllTypePlayers.UTIL;
        let excludePlayers = AllTypePlayers.Exclude;
        let lockedPlayers = AllTypePlayers.Lock;
        let exposurePlayer = {};
        if(AllTypePlayers.Exposure){
            exposurePlayer = AllTypePlayers.Exposure;
        }
        let complete = [];
        let allTeams = [];
        let teamArray = [];
        var currentdate = moment().tz("America/New_York").format('YYYY-MM-DDT00:00:00');

        let no_of_builds = 500;
        let get_builds = req.NumberOfBuild;
        // let get_builds = 5;
        let positions = ["CPT", "UTIL", "UTIL", "UTIL", "UTIL4", "UTIL5"];
        let singlepositions = ["CPT", "UTIL"];
        // let positions = ["G"];
        let SlateID = req.SlateID;
        let user = req.user;
        let operator = req.operator;
        let gametype = req.gametype;
        // console.log("user: ", user);
        // console.log("SlateID: ", SlateID);
        // console.log("NumberOfBuild: ", get_builds);  
        // let user = "603f1f85e9539b7d08bc7ed4";
        // let SlateID = 12283; 

        if (AllTypeTeams.length > 0) {
            allTeams = AllTypeTeams;
            get_builds = get_builds + AllTypeTeams.length;
            console.log(allTeams.length, AllTypeTeams.length, get_builds);
        }



        let LockedTeams = {};

        await PlayerPerTeam.find({ slatId: SlateID, user: user })
            .then(async teams => {
                // console.log("TEams ", teams);
                let teamStack = teams[0].teamStack;
                let teamStack_length = teamStack.length;
                for (let i = 0; i < teamStack_length; i++) {
                    // console.log("TEams ", teamStack[i].teamId);
                    if (teamStack[i].minNoOfPlayer > 0) {
                        LockedTeams[teamStack[i].teamId] = teamStack[i].minNoOfPlayer;
                    }
                }

            })
            .catch(error => {
                // console.log("player per team error");
            })



        // res.send(lockedPlayers,CPT_Players);

        let complete_team = 0;
        let count = 0;
        let reqsalary = 49000;
        let teamcreate = 0;
        let l = 1;
        for (let j = 0; j <= no_of_builds; j++) {
            let team = [];
            let teamCount = 1;
            // let complete_team = 0;
            let salary = 50000;
            for (let k = 0; k < positions.length; k++) {
                let position = positions[k];
                // console.log("position: ", position, " k: ", k, "j:", j);
                // let count =0;
                if (position === "CPT") {
                    CPT_Players = CPT_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    // PG_Players = PG_Players.filter(val => !excludePlayers.includes(val));

                    CPT_Players = CPT_Players.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection);
                    });

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    let playerCount = {};
                    let playerdet = {};
                    for (let i = 0; i < length;) {
                        if (CPT_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);

                            playerdet = CPT_Players.find(item => item.PlayerID === lockedPlayers[i].PlayerID);
                            // console.log("Sallary",playerdet.DraftKingsSalary);

                            if (playerdet.DraftKingsSalary === lockedPlayers[i].DraftKingsSalary) {
                                // console.log("yes sallary",lockedPlayers[i].DraftKingsSalary);
                                // console.log("yes ID",lockedPlayers[i].PlayerID);


                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                if (j != 0) {
                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                    if (!playerCount) {
                                        playerCount = 0;
                                    }
                                    // console.log("Count",playerCount);
                                    // console.log("onlyCount",playerCount.count);
                                    if (playerCount.count < playerexpo) {
                                        // console.log("enter");
                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                        i = length;
                                        continue;
                                    } else {
                                        // console.log("not enter");
                                        // sucess =  firstPLayer(teamArray, PG_Players, team, k, LockedTeams, position);
                                        // i = length;
                                        i++;
                                        continue;

                                    }

                                } else {
                                    // console.log("nlockfirst");
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                }

                            } else {
                                // console.log("no");
                                i++;
                                continue;
                            }
                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess",sucess);

                    if (sucess == 0) {
                        // console.log("PG_sucessPlayers");
                        // console.log("PG_Players",PG_Players);
                        sucess = firstPLayer(teamArray, CPT_Players, team, k, LockedTeams, position, lockedPlayers);
                    }

                    // console.log("sucess",sucess);

                }

                if (position === "UTIL") {
                    UTIL_Players = UTIL_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    // UTIL_Players = UTIL_Players.filter(val => !excludePlayers.includes(val));

                    // console.log("in util");
                    UTIL_Players = UTIL_Players.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.DraftKingsSalary;
                    }, 0);

                    let remainingplayer = positions.length - k;
                    // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                    let lastPlayerSal = (Math.abs(50000 - teamSalary) / remainingplayer);

                    // console.log("last player sal: ", lastPlayerSal);
                    // console.log("last team sal in util: ", teamSalary);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    let playerdet = {};
                    let playerCount = {};
                    for (let i = 0; i < length;) {
                        if (UTIL_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                            playerdet = UTIL_Players.find(item => item.PlayerID === lockedPlayers[i].PlayerID);
                            // console.log("Sallary",playerdet.DraftKingsSalary);

                            if (playerdet.DraftKingsSalary === lockedPlayers[i].DraftKingsSalary) {

                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                if (j != 0) {
                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                    if (!playerCount) {
                                        playerCount = 0;
                                    }
                                    // console.log("Count",playerCount);
                                    // console.log("onlyCount",playerCount.count);
                                    if (playerCount.count < playerexpo) {
                                        // console.log("enter");
                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                        i = length;
                                        continue;
                                    } else {
                                        // console.log("not enter");

                                        i++;
                                        continue;

                                    }

                                } else {
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                }
                            }
                            else {
                                // console.log("no");
                                i++;
                                continue;
                            }
                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("UTIL_sucessPlayers");
                        // if (lastPlayerSal > 6000) {
                        //     sucess = lastPlayer(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                        // }
                        // else {
                        sucess = addtolineup(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                        // }
                    }

                    // console.log("sucess",sucess);


                }

                if (position === "UTIL4") {
                    UTIL_Players = UTIL_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    // UTIL_Players = UTIL_Players.filter(val => !excludePlayers.includes(val));

                    // console.log("in util");
                    UTIL_Players = UTIL_Players.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.DraftKingsSalary;
                    }, 0);

                    let remainingplayer = positions.length - k;
                    // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                    let lastPlayerSal = (Math.abs(50000 - teamSalary) / remainingplayer);

                    // console.log("last player sal: ", lastPlayerSal);
                    // console.log("last team sal in util: ", teamSalary);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    let playerdet = {};
                    let playerCount = {};
                    for (let i = 0; i < length;) {
                        if (UTIL_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                            playerdet = UTIL_Players.find(item => item.PlayerID === lockedPlayers[i].PlayerID);
                            // console.log("Sallary",playerdet.DraftKingsSalary);

                            if (playerdet.DraftKingsSalary === lockedPlayers[i].DraftKingsSalary) {

                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                if (j != 0) {
                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                    if (!playerCount) {
                                        playerCount = 0;
                                    }
                                    // console.log("Count",playerCount);
                                    // console.log("onlyCount",playerCount.count);
                                    if (playerCount.count < playerexpo) {
                                        // console.log("enter");
                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                        i = length;
                                        continue;
                                    } else {
                                        // console.log("not enter");

                                        i++;
                                        continue;

                                    }

                                } else {
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                }
                            }
                            else {
                                // console.log("no");
                                i++;
                                continue;
                            }
                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("UTIL_sucessPlayers");
                        if (lastPlayerSal > 6000) {
                            sucess = lastPlayer(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                        else {
                            sucess = addtolineup(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                    }

                    // console.log("sucess",sucess);


                }

                if (position === "UTIL5") {
                    UTIL_Players = UTIL_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    // UTIL_Players = UTIL_Players.filter(val => !excludePlayers.includes(val));

                    // console.log("in util");
                    UTIL_Players = UTIL_Players.sort((a, b) => {
                        return (b.DraftKingsProjection - a.DraftKingsProjection);
                    });
                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.DraftKingsSalary;
                    }, 0);
                    let lastPlayerSal = Math.abs(50000 - teamSalary);
                    // console.log("last player sal: ", lastPlayerSal);
                    // console.log("last team sal in util: ", teamSalary);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    let playerdet = {};
                    let playerCount = {};
                    for (let i = 0; i < length;) {
                        if (UTIL_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);

                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                            playerdet = UTIL_Players.find(item => item.PlayerID === lockedPlayers[i].PlayerID);
                            if (!playerCount) {
                                playerCount = 0;
                            }
                            // console.log("Sallary",playerdet.DraftKingsSalary);

                            if (playerdet.DraftKingsSalary === lockedPlayers[i].DraftKingsSalary) {

                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                if (j != 0) {
                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                    // console.log("Count",playerCount);
                                    // console.log("onlyCount",playerCount.count);
                                    if (playerCount.count < playerexpo) {
                                        // console.log("enter");
                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                        i = length;
                                        continue;
                                    } else {
                                        // console.log("not enter");

                                        i++;
                                        continue;

                                    }

                                } else {
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                }
                            }
                            else {
                                // console.log("no");
                                i++;
                                continue;
                            }
                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("UTIL_sucessPlayers");
                        if (lastPlayerSal > 6000) {
                            sucess = lastPlayer(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                        else {
                            sucess = randomplayer(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                        }
                    }

                    // console.log("sucess2",sucess);

                    if (sucess == null) {
                        sucess = randomplayer(teamArray, UTIL_Players, team, k, LockedTeams, lastPlayerSal, position);
                    }

                    // console.log("sucess",sucess);


                }
            }

            function includelockPLayer(teamArr, playerArr, team, k, position) {

                // console.log("lock");
                if (teamArr.filter(el => el.TeamID == playerArr.TeamID).length == 0) {
                    // console.log("Before update: 3");
                    teamArr.push({ PlayerId: playerArr.PlayerID });
                    teamArr.push({ TeamID: playerArr.TeamID, teamCount });
                }
                else {
                    // console.log("Before update: 4");
                    let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr.TeamID));
                    if (teamArr[objIndex].teamCount < 4) {
                        // console.log("Before update: 5");
                        teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                        teamArr.push({ PlayerId: playerArr.PlayerID });
                    }
                    else {
                        // console.log("Before update: 6");
                        return 0;
                    }
                }

                if (complete.filter(el => el.id == playerArr.PlayerID).length == 0) {
                    // console.log("Before update: 1");
                    count = 1;
                    let playerDataWithCount = {
                        id: playerArr.PlayerID,
                        TeamID: playerArr.TeamID,
                        count: count
                    }
                    complete.push(playerDataWithCount);
                }
                else {

                    // console.log("Before update: 2");
                    let objIndex = complete.findIndex((obj => obj.id == playerArr.PlayerID));
                    // console.log("Before update: ", complete[objIndex]);
                    complete[objIndex].count = complete[objIndex].count + 1;
                }

                team[k] = playerArr;
                return 1;
            }

            function firstPLayer(teamArr, AllplayerArr, team, k, LockedTeams, position, lockedPlayers) {

                // console.log("lockedTeams: ", LockedTeams);
                // console.log("PlayerArray: ", teamArr); 
                let playerArr = [];

                if (LockedTeams) {
                    // array exists and is not empty
                    // console.log("lockedTeams: Last ", LockedTeams['9']);

                    for (const [key, value] of Object.entries(LockedTeams)) {
                        // console.log(key , value);
                        if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                            // console.log("yes:",);
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                            // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                            if (value > teamArr[objIndex].teamCount) {
                                // console.log("Teamid",key); 
                                // filter lock teams
                                let array1 = AllplayerArr.filter(obj => {

                                    // console.log("array :1 ", obj.TeamID); 
                                    return obj.TeamID == key
                                });
                                array1 = Object.assign(array1);
                                playerArr = playerArr.concat(array1);
                                // playerArr.push(array1);
                            }
                        } else {
                            // console.log("Teamid",key); 
                            let array1 = AllplayerArr.filter(obj => {

                                // console.log("array :1 ", obj.TeamID); 
                                return obj.TeamID == key
                            });
                            array1 = Object.assign(array1);
                            playerArr = playerArr.concat(array1);
                            // playerArr.push(array1);

                        }

                    }
                }


                // console.log("arrayfinal ", playerArr.length);

                if (playerArr.length == 0) {
                    playerArr = AllplayerArr;
                }

                // console.log("arrayfinal ", playerArr.length);

                playerArr = playerArr.sort((a, b) => {
                    return (b.DraftKingsProjection - a.DraftKingsProjection)
                })

                let length = playerArr.length - 1;
                for (let i = 0; i < length;) {
                    let n = Math.floor(Math.random() * Math.floor(4));
                    // console.log("teamId: ", n,playerArr[n].DraftKingsSalary);
                    let lockutil = 0;
                    if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0 && playerArr[n].DraftKingsProjection > 3) {

                        for (let l = 0; l < lockedPlayers.length;) {
                            if (playerArr[n].PlayerID === lockedPlayers[l].PlayerID) {
                                l = lockedPlayers.length;
                                lockutil = 1;
                            } else {
                                l++;
                            }
                        }

                        if (lockutil === 1) {
                            i++;
                            continue;
                        }

                        if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                            teamArr.push({ PlayerId: playerArr[n].PlayerID });
                            teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                        }
                        else {
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                            }
                            else {
                                i++;
                                continue;
                            }
                        }

                        if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                            count = 1;
                            let playerDataWithCount = {
                                id: playerArr[n].PlayerID,
                                TeamID: playerArr[n].TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {
                            let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }

                        salary = salary - playerArr[n].DraftKingsSalary;
                        team[k] = playerArr[n];
                        i = length;
                        // console.log("in compare team: ", team);
                        return 1;
                    }
                    else {
                        i++;
                    }
                }
            }

            function addtolineup(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position) {

                // console.log("lockedTeams: add to line up", LockedTeams);
                // console.log("PlayerArray: ", teamArr); 
                // console.log("Add to line up: ");

                let playerArr = [];

                if (LockedTeams) {
                    // array exists and is not empty
                    // console.log("lockedTeams: Last ", LockedTeams['9']);

                    for (const [key, value] of Object.entries(LockedTeams)) {
                        // console.log(key , value);
                        // console.log("teamArr.length: ", teamArr.length); 
                        // console.log("teamArr.filter(el => el.TeamID == key).length: ", teamArr.filter(el => el.TeamID == key).length); 
                        if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                            // console.log("yes:1",);
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                            // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                            if (value > teamArr[objIndex].teamCount) {
                                // console.log("Teenter",key); 
                                // filter lock teams
                                let array1 = AllplayerArr.filter(obj => {

                                    // console.log("array :1 ", obj.TeamID); 
                                    return obj.TeamID == key
                                });

                                array1 = Object.assign(array1);
                                playerArr = playerArr.concat(array1);
                                // playerArr.push(array1);
                            }
                        } else {
                            // console.log("yes:2",);
                            // console.log("Teamid",key); 
                            let array1 = AllplayerArr.filter(obj => {

                                // console.log("array :1 ", obj.TeamID); 
                                return obj.TeamID == key
                            });
                            array1 = Object.assign(array1);
                            playerArr = playerArr.concat(array1);
                            // playerArr.push(array1);

                        }

                    }
                }

                // console.log("arrayfinal before", playerArr.length);

                if (playerArr.length == 0) {
                    playerArr = AllplayerArr;
                }

                // console.log("arrayfinal ", playerArr.length);

                let addlastPlayerSal = lastPlayerSal - 2000;
                let endlastPlayerSal = lastPlayerSal + 4000;

                let length = playerArr.length + 30;
                let playerlength = playerArr.length - 1;
                for (let i = 0; i < length;) {

                    let n = Math.floor(Math.random() * Math.floor(playerlength));
                    // console.log("teamId: ", playerArr[n].TeamID);
                    // console.log("position: ", n,playerArr[n].DraftKingsSalary);
                    // console.log("salary: ", playerArr[n].DraftKingsSalary);
                    if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                        && endlastPlayerSal >= playerArr[n].DraftKingsSalary
                        && addlastPlayerSal <= playerArr[n].DraftKingsSalary && playerArr[n].DraftKingsProjection > 3) {
                        // console.log("position: enter3 ");
                        if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                            // console.log("position: 3 ");
                            teamArr.push({ PlayerId: playerArr[n].PlayerID });
                            teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                        }
                        else {
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                // console.log("position: 4 ");
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                            }
                            else {
                                // console.log("position: 5 ");
                                i++;
                                continue;
                            }
                        }

                        if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                            // console.log("position: 1 ");
                            count = 1;
                            let playerDataWithCount = {
                                id: playerArr[n].PlayerID,
                                TeamID: playerArr[n].TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {
                            // console.log("position: 2 ");
                            let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }


                        // salary = salary - playerArr[n].DraftKingsSalary;
                        team[k] = playerArr[n];
                        i = length;
                        // console.log("in compare team: ", team);
                        return 1;
                    }
                    else {
                        i++;
                    }
                }
            }

            function randomplayer(teamArr, playerArr, team, k, LockedTeams, lastPlayerSal, position) {

                // console.log("Random: ");
                let addlastPlayerSal = 3000;

                resultA = playerArr.sort((a, b) => {
                    return (b.DraftKingsProjection - a.DraftKingsProjection)
                })

                let length = playerArr.length - 1;
                for (let i = 0; i < length;) {
                    // let n = Math.floor(Math.random() * Math.floor(length));
                    // console.log("teamId: ", playerArr[n].TeamID);
                    // console.log("position: ", n);
                    // console.log("salary: ", playerArr[i].DraftKingsSalary);
                    if (teamArr.filter(item => item.PlayerId == playerArr[i].PlayerID).length == 0
                        && addlastPlayerSal <= playerArr[i].DraftKingsSalary && playerArr[i].DraftKingsProjection > 3) {
                        // console.log("position: enter3 ");
                        if (teamArr.filter(el => el.TeamID == playerArr[i].TeamID).length == 0) {
                            // console.log("position: 3 ");
                            teamArr.push({ PlayerId: playerArr[i].PlayerID });
                            teamArr.push({ TeamID: playerArr[i].TeamID, teamCount });
                        }
                        else {
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[i].TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                // console.log("position: 4 ");
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: playerArr[i].PlayerID });
                            }
                            else {
                                // console.log("position: 5 ");
                                i++;
                                continue;
                            }
                        }

                        if (complete.filter(el => el.id == playerArr[i].PlayerID).length == 0) {
                            // console.log("position: 1 ");
                            count = 1;
                            let playerDataWithCount = {
                                id: playerArr[i].PlayerID,
                                TeamID: playerArr[i].TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {
                            // console.log("position: 2 ");
                            let objIndex = complete.findIndex((obj => obj.id == playerArr[i].PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }


                        // salary = salary - playerArr[n].DraftKingsSalary;
                        team[k] = playerArr[i];
                        i = length;
                        // console.log("in compare team: ", team);
                        return 1;
                    }
                    else {
                        i++;
                    }
                }
            }

            function lastPlayer(teamArr, playerArr, team, k, LockedTeams, lastPlayerSal, position) {

                // console.log("last player");
                resultA = playerArr.sort((a, b) => {
                    return (b.DraftKingsProjection - a.DraftKingsProjection)
                })
                // console.log("resultA: ",resultA);
                let length = resultA.length - 1;



                // console.log("resultA: ",length);
                for (let l = 0; l <= length;) {
                    // console.log("teamId: ", resultA[l].TeamID);
                    // console.log("result inside l: ",resultA[l]);
                    // if (resultA[l].DepthChartOrder == '0') {
                    // console.log("result Sallary l: ",resultA[l].DraftKingsSalary,resultA[l].DraftKingsProjection);

                    if (teamArr.filter(item => item.PlayerId == resultA[l].PlayerID).length == 0
                        && lastPlayerSal >= resultA[l].DraftKingsSalary && resultA[l].DraftKingsProjection > 3
                    ) {
                        // console.log("resultA: 6");
                        if (teamArr.filter(el => el.TeamID == resultA[l].TeamID).length == 0) {
                            // console.log("resultA: 3");
                            teamArr.push({ PlayerId: resultA[l].PlayerID });
                            teamArr.push({ TeamID: resultA[l].TeamID, teamCount });
                        }
                        else {
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == resultA[l].TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                // console.log("resultA: 4");
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: resultA[l].PlayerID });
                            }
                            else {
                                // console.log("resultA: 5");
                                l++;
                                continue;
                            }
                        }

                        if (complete.filter(el => el.id == resultA[l].PlayerID).length == 0) {
                            // console.log("resultA: 1");
                            count = 1;
                            let playerDataWithCount = {
                                id: resultA[l].PlayerID,
                                TeamID: resultA[l].TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {
                            // console.log("resultA: 2");
                            let objIndex = complete.findIndex((obj => obj.id == resultA[l].PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }


                        // salary = salary - playerArr[l].DraftKingsSalary;
                        // console.log("teamArr: ",teamArr);
                        team[k] = resultA[l];
                        // console.log("in compare team: ", team);
                        l = length;

                        return 1;

                    }
                    else {
                        l++;
                        continue;
                    }
                    // }else{

                    //     l++;
                    // }
                }
            }



            // console.log("team: ", team);
            // console.log("complete: ",complete);
            // console.log("teamarray: ", teamArray);
            teamArray = [];

            let teamSalary = team.reduce((acc, item) => {
                // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                return acc + item.DraftKingsSalary;
            }, 0);

            // console.log("team salary", teamSalary);
            // console.log("complete team dgsdgsdgfdshfsdddddddfdhgggggggdgdgsgsdgsdg", team.length);

            let getbuild = l * 30;
            if (j == getbuild) {
                //    // console.log(getbuild,"team",j,complete_team,teamcreate,reqsalary);
                if (complete_team > teamcreate) {
                    reqsalary = reqsalary;
                    teamcreate = complete_team;
                } else {
                    reqsalary = reqsalary - 500;
                    teamcreate = complete_team;
                }
                l = l + 1;
            }

            if (teamSalary <= 50000 && teamSalary >= reqsalary) {
                // console.log("aeraea team salary", teamSalary);
                allTeams.push(team);

                let stringArray = allTeams.map(JSON.stringify);
                let uniqueStringArray = new Set(stringArray);
                allTeams = Array.from(uniqueStringArray, JSON.parse);

                complete_team = allTeams.length;

                for (const [key, value] of Object.entries(exposurePlayer)) {
                    // console.log(key, value);
                    let newplayerCount = complete.find(item => item.id === key);
                    if (newplayerCount)
                        if (value === newplayerCount.count) {
                            exposurePlayer[key] = 0;
                            delete exposurePlayer[key];
                        }
                }

            } else {

                for (const [key, value] of Object.entries(exposurePlayer)) {
                    // console.log(key, value);
                    exposurePlayer[key] = value + 1;
                }
                // console.log("Exposure players array: ", exposurePlayer);
            }
            // console.log("complete_team: ", complete_team);
            // console.log("get_builds: ", get_builds);
            if (complete_team == get_builds) {
                j = no_of_builds + 1;
            }
        }

        var totalteams = allTeams;
        // console.log("totalteams length", totalteams.length);
        const slatTeamData = {
            Teams: totalteams,
        }
        await SlatPlayers.updateOne({SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, slatTeamData, async (error, doc) => {
            if (error || !doc) {
                console.log("mlb DB error : Slat data update error");
            }
            else {
                console.log("mlb Teams data update");

                allTeams = allTeams.slice(-req.NumberOfBuild);



                let salaryArray = [];
                let projArray = [];
                for (let i = 0; i < allTeams.length; i++) {
                    let teamSalary = 0;
                    let teamProjection = 0;
                    for (let j = 0; j < allTeams[i].length; j++) {
                        // console.log("salary: ", allTeams[i][j].DraftKingsSalary);
                        teamSalary = teamSalary + allTeams[i][j].DraftKingsSalary;
                        teamProjection = teamProjection + allTeams[i][j].DraftKingsProjection;
                    }
                    // console.log("teamProjection",teamProjection);
                    salaryArray[i] = teamSalary;
                    var ProjectionArray = {};
                    Object.assign(ProjectionArray, { teamnumber: i, teamvalue: teamProjection });
                    projArray.push(ProjectionArray);
                }

                let stringArray = allTeams.map(JSON.stringify);
                let uniqueStringArray = new Set(stringArray);
                allTeams = Array.from(uniqueStringArray, JSON.parse);

                projArray = projArray.sort((a, b) => b.teamvalue - a.teamvalue);

                let projectarrangeTeams = [];
                let projectposition = [];
                for (let i = 0; i < projArray.length; i++) {
                    projectposition.push(projArray[i].teamnumber);
                }

                // console.log("projectposition",projectposition);

                for (let i = 0; i < allTeams.length; i++) {
                    // console.log(projectposition[i]);
                    let newteam = allTeams[projectposition[i]];
                    projectarrangeTeams.push(newteam);
                }


                allTeams = projectarrangeTeams;

                var senddata = {
                    "status": 0,
                    "success": true,
                    "allTeams": allTeams,
                    "salaryArray": salaryArray,
                    "delay": 1000
                }
                // socket.emit('mlbcreatebuild-success', allTeams,WR_Players,QB_Players,RB_Players,TE_Players,FLEX_Players,DST_Players);
                socket.emit('mlbcreatebuild-success', senddata);
                // console.log("allTeams: ", allTeams);
                // res.send({ status: 0, allTeams, salaryArray, B1_Players, B3_Players, OF_Players, B2_Players, SS_Players });
                // res.send({ PG_Players, SG_Players, PF_Players, SF_Players, G_Players, F_Players, UTIL_Players});
            }
        })

    }
    catch (error) {
        console.log(error);
        var response = {
            status: 1, success: false, messages: "something went wrong"
        }
        socket.emit('mlbcreatebuild-success', response);
        // res.send({ error, status: 1, success: false, messages: "something went wrong" });
    }
}



module.exports.socket_create_build_fandual_single = async function (io, socket, req) {
    try {
        let MVP_Players = [];
        let complete = [];
        let allTeams = [];
        let teamArray = [];
        var currentdate = moment().tz("America/New_York").format('YYYY-MM-DDT00:00:00');

        let no_of_builds = 1500;
        let get_builds = req.NumberOfBuild;
        // let get_builds = 5;
        let fandualpositions = ["UTIL"];
        let positions = ["MVP", "STAR", "UTIL", "UTIL2", "UTIL3"];
        // let positions = ["G"];
        let SlateID = req.SlateID;
        let user = req.user;
        // let user = "603f1f85e9539b7d08bc7ed4";
        // let SlateID = "12389";
        let operator = req.operator;
        let gametype = req.gametype;
        // console.log("user: ", user);
        // console.log("SlateID: ", SlateID);
        // console.log("NumberOfBuild: ", get_builds); 

        //     await  PlayerExposure.find({slatId : SlateID, user : user, type : "lock"})
        //     .then(async lockplayers =>{
        await PlayerExposure.distinct("slatePlayerID", { slatId: SlateID, user: user, type: "exclude" })
            .then(async exposureplayers => {
                // if(lockplayers.length === 0){

                //     return res.send({ status : 2, success: false, messages: "Please lock atleast one player" });
                // }else{

                for (let k = 0; k < fandualpositions.length; k++) {
                    let position = fandualpositions[k];
                    // let count =0;
                    // console.log("position: ", position, " k: ", k);
                    await Slats.aggregate([{ "$match": { "SlateID": SlateID } },
                    { "$unwind": "$PlayerId" },
                    { "$project": { "PlayerId": "$PlayerId", "_id": 0 } }
                    ])
                        .then(async result => {
                            // console.log("resultlength: ", result.length);

                            let allPlayers = [];
                            let playerslat = {};
                            for (let i = 0; i < result.length; i++) {
                                allPlayers[i] = result[i].PlayerId.PlayerID;
                                playerslat[result[i].PlayerId.PlayerID] = {
                                    "sallary": result[i].PlayerId.OperatorSalary1,
                                    "slatid": result[i].PlayerId.OperatorSlatePlayerID
                                }
                            }
                            // console.log( "length: ",allPlayers.length)
                            // res.send({allPlayers});
                            await PlayerStats.find({ PlayerID: { $in: allPlayers }, SportId: 2, Day: { $eq: currentdate } }, {
                                SportType: 1, SportId: 1, PlayerID: 1, DepthChartOrder: 1, Day: 1,
                                DepthChartPosition: 1, DraftKingsName: 1, Name: 1, InjuryStatus: 1,
                                InjuryStartDate: 1, InjuryBodyPart: 1, InjuryNotes: 1, DraftKingsProjection: 1,
                                DraftKingsPosition: 1, HomeOrAway: 1, FandDualProjection: 1, FPPDdraftking: 1, FPPDfanduel: 1,
                                PhotoUrl: 1, DraftKingsSalary: 1, FanDuelSalary: 1, Status: 1, TeamID: 1, FPPG: 1, FanDuelPosition: 1,
                                DraftKingsVal: 1, FanDualVal: 1, Games: 1, FantasyPoints: 1, Team: 1, SlatePlayerID: 1, _id: 0
                            })
                                .then(async players => {
                                    // console.log("palyers.length: ", players.length);  
                                    // res.send({players});

                                    // players.forEach(function (doc) {

                                    let n = 0;
                                    while (n < players.length) {

                                        let doc = players[n];

                                        let logo = await PlayerProjection.findOne({ playerId: doc.PlayerID, slatId: req.SlateID, user: req.user }, { projection: 1 });
                                        // console.log("logo",logo);
                                        if (logo != null) {
                                            // console.log("logo",logo);
                                            // console.log("logo",logo.projection);
                                            // player = player.toJSON();
                                            doc.DraftKingsProjection = logo.projection;
                                            doc.FandDualProjection = logo.projection;
                                        }

                                        // doc.set(SlatePlayerID, result[i].PlayerId.OperatorSlatePlayerID);
                                        if (doc !== null) {
                                            if (doc.InjuryStatus !== "Out") {
                                                if (playerslat[doc.PlayerID].slatid != "") {
                                                    doc["SlatePlayerID"] = playerslat[doc.PlayerID].slatid;
                                                }
                                                doc["DraftKingsSalary"] = playerslat[doc.PlayerID].sallary;
                                                doc["FanDuelSalary"] = playerslat[doc.PlayerID].sallary;
                                                // console.log("doc: ", doc);
                                                var indexof = exposureplayers.indexOf(doc.SlatePlayerID);
                                                if (indexof == -1) {

                                                    MVP_Players.push(doc);
                                                }
                                            }
                                        }
                                        n++;
                                    }

                                    // if (doc !== null) {
                                    //     if (doc.InjuryStatus !== "Out") {
                                    //         if (playerslat[doc.PlayerID].slatid != "") {
                                    //             doc["SlatePlayerID"] = playerslat[doc.PlayerID].slatid;
                                    //         }
                                    //         doc["DraftKingsSalary"] = playerslat[doc.PlayerID].sallary;
                                    //         doc["FanDuelSalary"] = playerslat[doc.PlayerID].sallary;
                                    //         // console.log("doc: ", doc);
                                    //         MVP_Players.push(doc);
                                    //     }
                                    // }

                                })
                            // res.send({players});
                        })
                        .catch(error => {
                            // console.log("error: ", error);
                            res.send({ error });
                        })
                }

                // let Lockeduserteam = 
                //     { 
                //         19:2,
                //         27:2
                //     };

                let LockedTeams = {};

                await PlayerPerTeam.find({ slatId: SlateID, user: user })
                    .then(async teams => {
                        // console.log("TEams ", teams);
                        let teamStack = teams[0].teamStack;
                        let teamStack_length = teamStack.length;
                        for (let i = 0; i < teamStack_length; i++) {
                            // console.log("TEams ", teamStack[i].teamId);
                            if (teamStack[i].minNoOfPlayer > 0) {
                                LockedTeams[teamStack[i].teamId] = teamStack[i].minNoOfPlayer;
                            }
                        }

                    })
                    .catch(error => {
                        // console.log("player per team error");
                    })

                // console.log("Player Per Team Lockeduserteam: ", Lockeduserteam);
                // console.log("Player Per Team: ", LockedTeams);

                let excludePlayers = [];
                await PlayerExposure.find({ slatId: SlateID, user: user, type: "exclude" })
                    .then(async players => {
                        let exclude_length = players.length;
                        for (let i = 0; i < exclude_length; i++) {
                            await PlayerStats.findOne({ PlayerID: players[i].playerId },
                                {
                                    SportType: 1, SportId: 1, PlayerID: 1, DepthChartOrder: 1,
                                    DepthChartPosition: 1, DraftKingsName: 1, Name: 1, InjuryStatus: 1,
                                    InjuryStartDate: 1, InjuryBodyPart: 1, InjuryNotes: 1, DraftKingsProjection: 1,
                                    DraftKingsPosition: 1, HomeOrAway: 1, FandDualProjection: 1, FPPDdraftking: 1, FPPDfanduel: 1,
                                    PhotoUrl: 1, Status: 1, TeamID: 1, FPPG: 1, FanDuelPosition: 1,
                                    DraftKingsVal: 1, FanDualVal: 1, Games: 1, FantasyPoints: 1, Team: 1, SlatePlayerID: 1, _id: 0
                                })
                                .then(async doc => {
                                    if (players[i].slatePlayerID != "") {
                                        doc["SlatePlayerID"] = players[i].slatePlayerID;
                                    }

                                    let logo = await PlayerProjection.findOne({ playerId: doc.PlayerID, slatId: req.SlateID, user: req.user }, { projection: 1 });
                                    // console.log("logo",logo);
                                    if (logo != null) {
                                        // console.log("logo",logo);
                                        // console.log("logo",logo.projection);
                                        // player = player.toJSON();
                                        doc.DraftKingsProjection = logo.projection;
                                        doc.FandDualProjection = logo.projection;
                                    }

                                    doc["DraftKingsSalary"] = players[i].sallary;
                                    doc["FanDuelSalary"] = players[i].sallary;

                                    excludePlayers.push(doc);

                                })
                        }


                    })
                    .catch(error => {
                        // console.log("exclude data find error");
                    })

                // console.log("exclude players array: ", excludePlayers);

                let lockedPlayers = [];
                let exposurePlayer = {};
                await PlayerExposure.find({ slatId: SlateID, user: user, type: { $ne: "exclude" } })
                    .then(async players => {
                        let exclude_length = players.length;
                        for (let i = 0; i < exclude_length; i++) {

                            if (players[i].type == "lock") {

                                exposurePlayer[players[i].playerId] = 1500;

                            } else {

                                var totalper = 0;
                                if (players[i].min > players[i].max) {
                                    totalper = players[i].min;
                                } else {
                                    totalper = players[i].max;
                                }

                                // console.log("totalper",players[i].playerId,totalper);

                                let inlineup = Math.round(Math.abs(totalper / 10));
                                inlineup = (inlineup * get_builds) / 10;
                                exposurePlayer[players[i].playerId] = Math.round(inlineup);
                            }

                            // exposurePlayer.push(inlineCount);
                            await PlayerStats.findOne({ PlayerID: players[i].playerId },
                                {
                                    SportType: 1, SportId: 1, PlayerID: 1, DepthChartOrder: 1,
                                    DepthChartPosition: 1, DraftKingsName: 1, Name: 1, InjuryStatus: 1,
                                    InjuryStartDate: 1, InjuryBodyPart: 1, InjuryNotes: 1, DraftKingsProjection: 1,
                                    DraftKingsPosition: 1, HomeOrAway: 1, FandDualProjection: 1, FPPDdraftking: 1, FPPDfanduel: 1,
                                    PhotoUrl: 1, Status: 1, TeamID: 1, FPPG: 1, FanDuelPosition: 1,
                                    DraftKingsVal: 1, FanDualVal: 1, Games: 1, FantasyPoints: 1, Team: 1, SlatePlayerID: 1, _id: 0
                                })
                                .then(async doc => {
                                    if (players[i].slatePlayerID != "") {
                                        doc["SlatePlayerID"] = players[i].slatePlayerID;
                                    }

                                    let logo = await PlayerProjection.findOne({ playerId: doc.PlayerID, slatId: req.SlateID, user: req.user }, { projection: 1 });
                                    // console.log("logo",logo);
                                    if (logo != null) {
                                        // console.log("logo",logo);
                                        // console.log("logo",logo.projection);
                                        // player = player.toJSON();
                                        doc.DraftKingsProjection = logo.projection;
                                        doc.FandDualProjection = logo.projection;
                                    }

                                    doc["DraftKingsSalary"] = players[i].sallary;
                                    doc["FanDuelSalary"] = players[i].sallary;
                                    doc["LockPosition"] = players[i].positiontype;

                                    lockedPlayers.push(doc);

                                })
                        }


                    })
                    .catch(error => {
                        // console.log("exclude locked data find error");
                    })

                let playerByPosition = {};
                let isLineUpCreated = await SlatPlayers.findOne({ SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, { SportId: 1 });
                console.log("logo", isLineUpCreated);

                playerByPosition.MVP = MVP_Players;
                playerByPosition.Lock = lockedPlayers;
                playerByPosition.Exclude = excludePlayers;
                playerByPosition.Exposure = exposurePlayer;

                if (isLineUpCreated != null) {

                    const slatPlayerData = {
                        Players: playerByPosition,
                    }
                    await SlatPlayers.update({SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, slatPlayerData, (error, doc) => {
                        if (error || !doc) {
                            console.log("mlb DB error : Slat data update error");
                        }
                        else {
                            console.log("mlb Player data update");
                        }
                    })
                } else {
                    const slatPlayerData = new SlatPlayers({
                        SportType: "MLB",
                        SportId: "2",
                        SlatID: req.SlateID,
                        UserId: req.user,
                        Players: playerByPosition,

                    })
                    await slatPlayerData.save((error, doc) => {
                        if (error || !doc) {
                            console.log(error);
                        }
                        else {
                            console.log("mlb mlb player data added");
                        }
                    });
                }

                // console.log("Locked players array: ", lockedPlayers);
                // console.log("Exposure players array: ", exposurePlayer);

                let complete_team = 0;
                let count = 0;
                let reqsalary = 34000;
                let teamcreate = 0;
                let l = 1;
                for (let j = 0; j <= no_of_builds; j++) {
                    let team = [];
                    let teamCount = 1;
                    // let complete_team = 0;
                    let salary = 35000;
                    for (let k = 0; k < positions.length; k++) {
                        let position = positions[k];
                        // console.log("position: ", position, " k: ", k, "j:", j);
                        // let count =0;
                        if (position === "MVP") {
                            MVP_Players = MVP_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                .includes(JSON.stringify(elm)));



                            // PG_Players = PG_Players.filter(val => !excludePlayers.includes(val));

                            MVP_Players = MVP_Players.sort((a, b) => {
                                return (b.FPPDfanduel - a.FPPDfanduel);
                            });

                            let teamSalary = team.reduce((acc, item) => {
                                return acc + item.FanDuelSalary;
                            }, 0);

                            let remainingplayer = positions.length - k;
                            // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                            let lastPlayerSal = (Math.abs(35000 - teamSalary) / remainingplayer);
                            // console.log("last player sal In PG: ", lastPlayerSal);

                            let length = lockedPlayers.length;
                            let sucess = 0;
                            let playerCount = {};
                            for (let i = 0; i < length;) {
                                if (MVP_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                    // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);

                                    if (lockedPlayers[i].LockPosition == 1) {

                                        let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                        if (j != 0) {
                                            playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                            if (!playerCount) {
                                                playerCount = 0;
                                            }
                                            // console.log("playerexpo",playerexpo);
                                            // console.log("onlyCount",playerCount.count);
                                            if (playerCount.count <= playerexpo) {
                                                // console.log("enter");
                                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                i = length;
                                                continue;
                                            } else {
                                                // console.log("not enter");
                                                // sucess =  firstPLayer(teamArray, PG_Players, team, k, LockedTeams, position);
                                                // i = length;
                                                i++;
                                                continue;

                                            }

                                        } else {
                                            sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                            i = length;
                                            continue;
                                        }
                                    }
                                    else {
                                        // console.log("no");
                                        i++;
                                        continue;
                                    }

                                }
                                else {
                                    // console.log("no");
                                    i++;
                                }
                            }

                            // console.log("sucess1",sucess);

                            if (sucess == 0) {
                                // console.log("PG_sucessPlayers");

                                sucess = firstPLayer(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);

                            }

                            // console.log("sucess",sucess);

                        }

                        if (position === "STAR") {
                            MVP_Players = MVP_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                .includes(JSON.stringify(elm)));

                            // SG_Players = SG_Players.filter(val => !excludePlayers.includes(val));

                            MVP_Players = MVP_Players.sort((a, b) => {
                                return (b.FPPDfanduel - a.FPPDfanduel);
                            });

                            let teamSalary = team.reduce((acc, item) => {
                                // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                return acc + item.FanDuelSalary;
                            }, 0);

                            let remainingplayer = positions.length - k;
                            // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                            let lastPlayerSal = (Math.abs(35000 - teamSalary) / 4);

                            // console.log("last player sal In STAR: ", lastPlayerSal);

                            let length = lockedPlayers.length;
                            let sucess = 0;
                            for (let i = 0; i < length;) {
                                if (MVP_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                    // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);

                                    if (lockedPlayers[i].LockPosition == 2) {
                                        let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                        if (j != 0) {
                                            playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                            if (!playerCount) {
                                                playerCount = 0;
                                            }
                                            // console.log("playerexpo",playerexpo);
                                            // console.log("onlyCount",playerCount.count);
                                            if (playerCount.count <= playerexpo) {
                                                // console.log("enter");
                                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                i = length;
                                                continue;
                                            } else {
                                                // console.log("not enter");
                                                // sucess =  addtolineup(teamArray, SG_Players, team, k, LockedTeams, position);
                                                // i = length;
                                                i++;
                                                continue;

                                            }

                                        } else {
                                            sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                            i = length;
                                            continue;
                                        }
                                    }
                                    else {
                                        // console.log("no");
                                        i++;
                                        continue;
                                    }
                                }
                                else {
                                    // console.log("no");
                                    i++;
                                }
                            }

                            // console.log("sucess1",sucess);

                            if (sucess == 0) {
                                // console.log("SG_sucessPlayers");
                                // console.log("PG_Players",PG_Players);
                                sucess = addtolineup(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);


                            }

                            if (sucess == null) {
                                // console.log("sucess second in SG",sucess);
                                sucess = randomplayer(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);
                            }

                            // console.log("sucess",sucess);

                        }

                        if (position === "UTIL") {
                            MVP_Players = MVP_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                .includes(JSON.stringify(elm)));

                            // SF_Players = SF_Players.filter(val => !excludePlayers.includes(val));

                            MVP_Players = MVP_Players.sort((a, b) => {
                                return (b.FPPDfanduel - a.FPPDfanduel);
                            });

                            let teamSalary = team.reduce((acc, item) => {
                                // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                return acc + item.FanDuelSalary;
                            }, 0);

                            let remainingplayer = positions.length - k;
                            // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                            let lastPlayerSal = (Math.abs(35000 - teamSalary) / 3);

                            // console.log("last player sal In SF: ", lastPlayerSal);

                            let length = lockedPlayers.length;
                            let sucess = 0;
                            for (let i = 0; i < length;) {
                                if (MVP_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                    // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                                    if (lockedPlayers[i].LockPosition == 3) {
                                        let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                        if (j != 0) {
                                            playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                            if (!playerCount) {
                                                playerCount = 0;
                                            }
                                            // console.log("playerexpo",playerexpo);
                                            // console.log("onlyCount",playerCount.count);
                                            if (playerCount.count <= playerexpo) {
                                                // console.log("enter");
                                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                i = length;
                                                continue;
                                            } else {
                                                // console.log("not enter");
                                                // sucess =  addtolineup(teamArray, SF_Players, team, k, LockedTeams, position);
                                                // i = length;
                                                i++;
                                                continue;

                                            }

                                        } else {
                                            sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                            i = length;
                                            continue;
                                        }

                                    }
                                    else {
                                        // console.log("no");
                                        i++;
                                        continue;
                                    }
                                }
                                else {
                                    // console.log("no");
                                    i++;
                                }
                            }

                            // console.log("sucess1",sucess);

                            if (sucess == 0) {
                                // console.log("SF_sucessPlayers");
                                // console.log("PG_Players",PG_Players);
                                if (lastPlayerSal > 7000) {
                                    sucess = lastPlayer(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);
                                }
                                else {
                                    sucess = addtolineup(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);
                                }
                                // sucess = addtolineup(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position,lockedPlayers);


                            }

                            if (sucess == null) {
                                // console.log("sucess second in SG",sucess);
                                sucess = randomplayer(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);
                            }
                            // console.log("sucess",sucess);

                        }

                        if (position === "UTIL2") {
                            MVP_Players = MVP_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                .includes(JSON.stringify(elm)));

                            // PF_Players = PF_Players.filter(val => !excludePlayers.includes(val));

                            MVP_Players = MVP_Players.sort((a, b) => {
                                return (b.FPPDfanduel - a.FPPDfanduel);
                            });

                            let teamSalary = team.reduce((acc, item) => {
                                // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                return acc + item.DraftKingsSalary;
                            }, 0);

                            let remainingplayer = positions.length - k;
                            // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                            let lastPlayerSal = (Math.abs(35000 - teamSalary) / 2);

                            // console.log("last player sal In UTIL2: ", lastPlayerSal);

                            let length = lockedPlayers.length;
                            let sucess = 0;
                            for (let i = 0; i < length;) {
                                if (MVP_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                    // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                                    if (lockedPlayers[i].LockPosition == 4) {
                                        let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                        if (j != 0) {
                                            playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                            if (!playerCount) {
                                                playerCount = 0;
                                            }
                                            // console.log("playerexpo",playerexpo);
                                            // console.log("onlyCount",playerCount.count);
                                            if (playerCount.count <= playerexpo) {
                                                // console.log("enter");
                                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                i = length;
                                                continue;
                                            } else {
                                                // console.log("not enter");
                                                // sucess =  addtolineup(teamArray, PF_Players, team, k, LockedTeams, position);
                                                // i = length;
                                                i++;
                                                continue;

                                            }

                                        } else {
                                            sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                            i = length;
                                            continue;
                                        }

                                    }
                                    else {
                                        // console.log("no");
                                        i++;
                                        continue;
                                    }
                                }
                                else {
                                    // console.log("no");
                                    i++;
                                }
                            }

                            // console.log("sucess1",sucess);

                            if (sucess == 0) {
                                // console.log("PF_sucessPlayers");
                                // console.log("PG_Players",PG_Players);
                                if (lastPlayerSal > 6500) {
                                    sucess = lastPlayer(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);
                                }
                                else {
                                    sucess = addtolineup(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);
                                }
                                // sucess = addtolineup(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position,lockedPlayers);

                            }

                            if (sucess == null) {
                                // console.log("sucess second in SG",sucess);
                                sucess = randomplayer(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);
                            }

                            // console.log("sucess",sucess);

                        }

                        if (position === "UTIL3") {
                            MVP_Players = MVP_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                                .includes(JSON.stringify(elm)));

                            // C_Players = C_Players.filter(val => !excludePlayers.includes(val));

                            MVP_Players = MVP_Players.sort((a, b) => {
                                return (b.FPPDfanduel - a.FPPDfanduel);
                            });

                            let teamSalary = team.reduce((acc, item) => {
                                // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                                return acc + item.FanDuelSalary;
                            }, 0);
                            let lastPlayerSal = (Math.abs(35000 - teamSalary));
                            // console.log("last player sal In UTIL3: ", lastPlayerSal);

                            let length = lockedPlayers.length;
                            let sucess = 0;
                            for (let i = 0; i < length;) {
                                if (MVP_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                                    // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                                    if (lockedPlayers[i].LockPosition == 5) {
                                        let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];

                                        if (j != 0) {
                                            playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                            if (!playerCount) {
                                                playerCount = 0;
                                            }
                                            // console.log("Sallary",lockedPlayers[i].DraftKingsSalary);
                                            // console.log("playerexpo",playerexpo);
                                            // console.log("onlyCount",playerCount.count);
                                            if (playerCount.count <= playerexpo) {
                                                // console.log("enter");
                                                sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                                i = length;
                                                continue;
                                            } else {
                                                // console.log("not enter");
                                                i++;
                                                continue;

                                            }

                                        } else {
                                            sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                            // console.log("sucess in lock",sucess);
                                            i = length;
                                            continue;
                                        }

                                    }
                                    else {
                                        // console.log("no");
                                        i++;
                                        continue;
                                    }

                                }
                                else {
                                    // console.log("no");
                                    i++;
                                }
                            }


                            // console.log("sucess1",sucess);

                            if (sucess == 0) {
                                // console.log("C_sucessPlayers");
                                // console.log("PG_Players",PG_Players);
                                sucess = lastPlayer(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);


                            }
                            // console.log("sucess2",sucess);
                            if (sucess == null) {
                                // console.log("sucess second in SG",sucess);
                                sucess = randomplayer(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);
                            }

                            // console.log("sucess",sucess);

                            // addtolineup(teamArray, C_Players, team, k,lastPlayerSal, position);
                            // console.log("in c");
                        }

                    }

                    function includelockPLayer(teamArr, playerArr, team, k, position) {
                        // console.log("lock");

                        if (teamArr.filter(el => el.TeamID == playerArr.TeamID).length == 0) {
                            // console.log("Before update: 3");
                            teamArr.push({ PlayerId: playerArr.PlayerID });
                            teamArr.push({ TeamID: playerArr.TeamID, teamCount });
                        }
                        else {
                            // console.log("Before update: 4");
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr.TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                // console.log("Before update: 5");
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: playerArr.PlayerID });
                            }
                            else {
                                // console.log("Before update: 6");
                                return 0;
                            }
                        }

                        if (complete.filter(el => el.id == playerArr.PlayerID).length == 0) {
                            // console.log("Before update: 1");
                            count = 1;
                            let playerDataWithCount = {
                                id: playerArr.PlayerID,
                                TeamID: playerArr.TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {

                            // console.log("Before update: 2");
                            let objIndex = complete.findIndex((obj => obj.id == playerArr.PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }

                        team[k] = playerArr;
                        return 1;
                    }

                    function firstPLayer(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers) {

                        // console.log("lockedTeams: ", LockedTeams);
                        // console.log("PlayerArray: ", teamArr); 
                        let playerArr = [];

                        if (LockedTeams) {
                            // array exists and is not empty
                            // console.log("lockedTeams: Last ", LockedTeams['9']);

                            for (const [key, value] of Object.entries(LockedTeams)) {
                                // console.log(key , value);
                                if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                                    // console.log("yes:",);
                                    let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                                    // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                                    if (value > teamArr[objIndex].teamCount) {
                                        // console.log("Teamid",key); 
                                        // filter lock teams
                                        let array1 = AllplayerArr.filter(obj => {

                                            // console.log("array :1 ", obj.TeamID); 
                                            return obj.TeamID == key
                                        });
                                        array1 = Object.assign(array1);
                                        playerArr = playerArr.concat(array1);
                                        // playerArr.push(array1);
                                    }
                                } else {
                                    // console.log("Teamid",key); 
                                    let array1 = AllplayerArr.filter(obj => {

                                        // console.log("array :1 ", obj.TeamID); 
                                        return obj.TeamID == key
                                    });
                                    array1 = Object.assign(array1);
                                    playerArr = playerArr.concat(array1);
                                    // playerArr.push(array1);

                                }

                            }
                        }


                        // console.log("arrayfinal ", playerArr.length);

                        if (playerArr.length == 0) {
                            playerArr = AllplayerArr;
                        }

                        playerArr = playerArr.sort((a, b) => {
                            return (b.FandDualProjection - a.FandDualProjection)
                        })

                        // console.log("arrayfinal ", playerArr);

                        // let addlastPlayerSal = lastPlayerSal - 500;

                        let length = playerArr.length - 1;
                        for (let i = 0; i < length;) {
                            let n = Math.floor(Math.random() * Math.floor(2));
                            // console.log("teamId: ", n,playerArr[n].FandDualProjection,playerArr[n].FanDualVal);
                            let lockutil = 0;
                            if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0 && playerArr[n].FandDualProjection >= 3 && playerArr[n].FanDualVal >= 1) {

                                for (let l = 0; l < lockedPlayers.length;) {
                                    if (playerArr[n].PlayerID === lockedPlayers[l].PlayerID) {
                                        l = lockedPlayers.length;
                                        lockutil = 1;
                                    } else {
                                        l++;
                                    }
                                }

                                if (lockutil === 1) {
                                    i++;
                                    continue;
                                }

                                if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                    teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                }
                                else {
                                    let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                    if (teamArr[objIndex].teamCount < 4) {
                                        teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                        teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                    }
                                    else {
                                        i++;
                                        continue;
                                    }
                                }

                                if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                    count = 1;
                                    let playerDataWithCount = {
                                        id: playerArr[n].PlayerID,
                                        TeamID: playerArr[n].TeamID,
                                        count: count
                                    }
                                    complete.push(playerDataWithCount);
                                }
                                else {
                                    let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                    // console.log("Before update: ", complete[objIndex]);
                                    complete[objIndex].count = complete[objIndex].count + 1;
                                }

                                salary = salary - playerArr[n].FanDuelSalary;
                                team[k] = playerArr[n];
                                i = length;
                                // console.log("in compare team: ", team);
                                return 1;
                            }
                            else {
                                i++;
                            }
                        }
                    }

                    function addtolineup(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers) {

                        // console.log("lockedTeams: add to line up", LockedTeams);
                        // console.log("PlayerArray: ", teamArr); 
                        // console.log("Add to line up: ");

                        let playerArr = [];
                        let playerlength = 0

                        if (LockedTeams) {
                            // array exists and is not empty
                            // console.log("lockedTeams: Last ", LockedTeams['9']);

                            for (const [key, value] of Object.entries(LockedTeams)) {
                                // console.log(key , value);
                                // console.log("teamArr.length: ", teamArr.length); 
                                // console.log("teamArr.filter(el => el.TeamID == key).length: ", teamArr.filter(el => el.TeamID == key).length); 
                                if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                                    // console.log("yes:1",);
                                    let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                                    // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                                    if (value > teamArr[objIndex].teamCount) {
                                        // console.log("Teenter",key); 
                                        // filter lock teams
                                        let array1 = AllplayerArr.filter(obj => {

                                            // console.log("array :1 ", obj.TeamID); 
                                            return obj.TeamID == key
                                        });

                                        array1 = Object.assign(array1);
                                        playerArr = playerArr.concat(array1);
                                        // playerArr.push(array1);
                                    }
                                } else {
                                    // console.log("yes:2",);
                                    // console.log("Teamid",key); 
                                    let array1 = AllplayerArr.filter(obj => {

                                        // console.log("array :1 ", obj.TeamID); 
                                        return obj.TeamID == key
                                    });
                                    array1 = Object.assign(array1);
                                    playerArr = playerArr.concat(array1);
                                    // playerArr.push(array1);

                                }

                            }
                        }

                        // console.log("arrayfinal before", playerArr.length);

                        if (playerArr.length == 0) {
                            playerArr = AllplayerArr;
                        }

                        // console.log("arrayfinal ", playerArr.length);

                        let addlastPlayerSal = lastPlayerSal - 4000;
                        let endlastPlayerSal = lastPlayerSal + 1000;

                        // console.log("addlastPlayerSal ", addlastPlayerSal);

                        let length = playerArr.length + 30;
                        if (playerArr.length > 20) {
                            playerlength = 19;
                        } else {
                            playerlength = playerArr.length - 1;
                        }
                        // console.log("playerlength",playerlength,playerArr.length);
                        for (let i = 0; i < length;) {

                            let n = Math.floor(Math.random() * Math.floor(playerlength));
                            // console.log("teamId: ", playerArr[n].TeamID);
                            // console.log("position: ", n);
                            // console.log("salary: ",n, playerArr[n].FanDuelSalary,playerArr[n].FandDualProjection,playerArr[n].FanDualVal);

                            let lockutil = 0;

                            if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                                && endlastPlayerSal >= playerArr[n].FanDuelSalary
                                && addlastPlayerSal <= playerArr[n].FanDuelSalary && playerArr[n].FandDualProjection >= 3 && playerArr[n].FanDualVal >= 1) {
                                // console.log("position: enter3 ");

                                for (let l = 0; l < lockedPlayers.length;) {
                                    // console.log("lockutil",lockedPlayers[l].PlayerID,playerArr[n].PlayerID);
                                    if (playerArr[n].PlayerID == lockedPlayers[l].PlayerID) {
                                        // console.log("lockutil11111");
                                        l = lockedPlayers.length;
                                        lockutil = 1;
                                    } else {
                                        // console.log("lockutil222222");
                                        l++;
                                    }
                                }

                                // console.log("lockutil",lockutil);

                                if (lockutil === 1) {
                                    i++;
                                    continue;
                                }

                                if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                                    // console.log("position: 3 ");
                                    teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                    teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                                }
                                else {
                                    let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                                    if (teamArr[objIndex].teamCount < 4) {
                                        // console.log("position: 4 ");
                                        teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                        teamArr.push({ PlayerId: playerArr[n].PlayerID });
                                    }
                                    else {
                                        // console.log("position: 5 ");
                                        i++;
                                        continue;
                                    }
                                }

                                if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                                    // console.log("position: 1 ");
                                    count = 1;
                                    let playerDataWithCount = {
                                        id: playerArr[n].PlayerID,
                                        TeamID: playerArr[n].TeamID,
                                        count: count
                                    }
                                    complete.push(playerDataWithCount);
                                }
                                else {
                                    // console.log("position: 2 ");
                                    let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                                    // console.log("Before update: ", complete[objIndex]);
                                    complete[objIndex].count = complete[objIndex].count + 1;
                                }


                                // salary = salary - playerArr[n].DraftKingsSalary;
                                team[k] = playerArr[n];
                                i = length;
                                // console.log("in compare team: ", team);
                                return 1;
                            }
                            else {
                                i++;
                            }
                        }
                    }

                    function randomplayer(teamArr, playerArr, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers) {

                        // console.log("Random: ");
                        let addlastPlayerSal = lastPlayerSal - 500;

                        resultA = playerArr.sort((a, b) => {
                            return (a.DraftKingsSalary - b.DraftKingsSalary)
                        })

                        let length = playerArr.length - 1;
                        for (let i = 0; i < length;) {
                            // let n = Math.floor(Math.random() * Math.floor(length));
                            // console.log("teamId: ", playerArr[n].TeamID);
                            // console.log("position: ", n);
                            // console.log("salary: ", playerArr[i].DraftKingsSalary);

                            let lockutil = 0;

                            if (teamArr.filter(item => item.PlayerId == playerArr[i].PlayerID).length == 0
                                && addlastPlayerSal <= playerArr[i].FanDuelSalary
                                && playerArr[i].FandDualProjection >= 3) {
                                // console.log("position: enter3 ");

                                for (let l = 0; l < lockedPlayers.length;) {
                                    if (playerArr[i].PlayerID === lockedPlayers[l].PlayerID) {
                                        l = lockedPlayers.length;
                                        lockutil = 1;
                                    } else {
                                        l++;
                                    }
                                }

                                if (lockutil === 1) {
                                    i++;
                                    continue;
                                }

                                if (teamArr.filter(el => el.TeamID == playerArr[i].TeamID).length == 0) {
                                    // console.log("position: 3 ");
                                    teamArr.push({ PlayerId: playerArr[i].PlayerID });
                                    teamArr.push({ TeamID: playerArr[i].TeamID, teamCount });
                                }
                                else {
                                    let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[i].TeamID));
                                    if (teamArr[objIndex].teamCount < 4) {
                                        // console.log("position: 4 ");
                                        teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                        teamArr.push({ PlayerId: playerArr[i].PlayerID });
                                    }
                                    else {
                                        // console.log("position: 5 ");
                                        i++;
                                        continue;
                                    }
                                }

                                if (complete.filter(el => el.id == playerArr[i].PlayerID).length == 0) {
                                    // console.log("position: 1 ");
                                    count = 1;
                                    let playerDataWithCount = {
                                        id: playerArr[i].PlayerID,
                                        TeamID: playerArr[i].TeamID,
                                        count: count
                                    }
                                    complete.push(playerDataWithCount);
                                }
                                else {
                                    // console.log("position: 2 ");
                                    let objIndex = complete.findIndex((obj => obj.id == playerArr[i].PlayerID));
                                    // console.log("Before update: ", complete[objIndex]);
                                    complete[objIndex].count = complete[objIndex].count + 1;
                                }


                                // salary = salary - playerArr[n].DraftKingsSalary;
                                team[k] = playerArr[i];
                                i = length;
                                // console.log("in compare team: ", team);
                                return 1;
                            }
                            else {
                                i++;
                            }
                        }
                    }

                    function lastPlayer(teamArr, playerArr, team, k, LockedTeams, lastPlayerSal, position) {

                        // console.log("resultA: LAst ");
                        // let resultA = playerArr.filter(elm => !teamArr.map(elm => JSON.stringify(elm))
                        //     .includes(JSON.stringify(elm)));

                        // let resultPLayerA= playerArr.filter(function(cv){
                        //     return !teamArr.find(function(e){
                        //         return e.PlayerId == cv.PlayerID;
                        //     });
                        // });

                        resultA = playerArr.sort((a, b) => {
                            return (b.FanDuelSalary - a.FanDuelSalary)
                        })
                        // console.log("resultA: ",resultA.length);
                        let length = resultA.length - 1;
                        // console.log("resultA: ",teamCount);
                        for (let l = 0; l <= length;) {
                            // console.log("teamId: ", resultA[l].TeamID);
                            // console.log("result inside l: ",resultA[l]);
                            // console.log("result Sallary l: ",l,resultA[l].FanDuelSalary,resultA[l].FandDualProjection);

                            if (teamArr.filter(item => item.PlayerId == resultA[l].PlayerID).length == 0
                                && lastPlayerSal >= resultA[l].FanDuelSalary
                                && resultA[l].FandDualProjection >= 3) {

                                if (teamArr.filter(el => el.TeamID == resultA[l].TeamID).length == 0) {
                                    // console.log("resultA: 3");
                                    teamArr.push({ PlayerId: resultA[l].PlayerID });
                                    teamArr.push({ TeamID: resultA[l].TeamID, teamCount });
                                }
                                else {
                                    let objIndex = teamArr.findIndex((obj => obj.TeamID == resultA[l].TeamID));
                                    if (teamArr[objIndex].teamCount < 4) {
                                        // console.log("resultA: 4");
                                        teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                        teamArr.push({ PlayerId: resultA[l].PlayerID });
                                    }
                                    else {
                                        // console.log("resultA: 5");
                                        l++;
                                        continue;
                                    }
                                }

                                if (complete.filter(el => el.id == resultA[l].PlayerID).length == 0) {
                                    // console.log("resultA: 1");
                                    count = 1;
                                    let playerDataWithCount = {
                                        id: resultA[l].PlayerID,
                                        TeamID: resultA[l].TeamID,
                                        count: count
                                    }
                                    complete.push(playerDataWithCount);
                                }
                                else {
                                    // console.log("resultA: 2");
                                    let objIndex = complete.findIndex((obj => obj.id == resultA[l].PlayerID));
                                    // console.log("Before update: ", complete[objIndex]);
                                    complete[objIndex].count = complete[objIndex].count + 1;
                                }


                                // salary = salary - playerArr[l].DraftKingsSalary;
                                // console.log("teamArr: ",teamArr);
                                team[k] = resultA[l];
                                // console.log("in compare team: ", team);
                                l = length;

                                return 1;

                            }
                            else {
                                l++;
                                continue;
                            }
                        }
                    }

                    // console.log("team: ", team);
                    // console.log("complete: ",complete);
                    // console.log("teamarray: ", teamArray);
                    teamArray = [];

                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.FanDuelSalary;
                    }, 0);

                    // console.log("team salary", teamSalary);
                    // console.log("complete team dgsdgsdgfdshfsdddddddfdhgggggggdgdgsgsdgsdg", team.length);

                    let getbuild = l * 30;
                    if (j == getbuild) {
                        //    // console.log(getbuild,"team",j,complete_team,teamcreate,reqsalary);
                        if (complete_team > teamcreate) {
                            reqsalary = reqsalary;
                            teamcreate = complete_team;
                        } else {
                            reqsalary = reqsalary - 500;
                            teamcreate = complete_team;
                        }
                        l = l + 1;
                    }

                    if (teamSalary <= 35000 && teamSalary >= reqsalary) {
                        // console.log("aeraea team salary", teamSalary);
                        // let fanteam = team.reverse();
                        allTeams.push(team);

                        let stringArray = allTeams.map(JSON.stringify);
                        let uniqueStringArray = new Set(stringArray);
                        allTeams = Array.from(uniqueStringArray, JSON.parse);

                        complete_team = allTeams.length;

                        for (const [key, value] of Object.entries(exposurePlayer)) {
                            // console.log(key, value);
                            let newplayerCount = complete.find(item => item.id === key);
                            if (newplayerCount)
                                if (value === newplayerCount.count) {
                                    exposurePlayer[key] = 0;
                                    delete exposurePlayer[key];
                                }
                        }

                    } else {

                        for (const [key, value] of Object.entries(exposurePlayer)) {
                            // console.log(key, value);
                            exposurePlayer[key] = value + 1;
                        }
                        // console.log("Exposure players array: ", exposurePlayer);
                    }
                    // console.log("complete_team: ", complete_team);
                    // console.log("get_builds: ", get_builds);
                    if (complete_team == get_builds) {
                        j = no_of_builds + 1;
                    }
                }

                var totalteams = allTeams;



                allTeams = allTeams.slice(-req.NumberOfBuild);

                // console.log("allTeams: ", allTeams);
                // let salaryArray = [];
                // for (let i = 0; i < allTeams.length; i++) {
                //     let teamSalary = 0;
                //     for (let j = 0; j < allTeams[i].length; j++) {
                //         // console.log("i",i,"j: ", j);
                //         // console.log("salary: ", allTeams[i][j].DraftKingsSalary);
                //         teamSalary = teamSalary + allTeams[i][j].FanDuelSalary;
                //     }
                //     salaryArray[i] = teamSalary;
                // }

                // let stringArray = allTeams.map(JSON.stringify);
                // let uniqueStringArray = new Set(stringArray);
                // allTeams = Array.from(uniqueStringArray, JSON.parse);

                let salaryArray = [];
                let projArray = [];
                for (let i = 0; i < allTeams.length; i++) {
                    let teamSalary = 0;
                    let teamProjection = 0;
                    for (let j = 0; j < allTeams[i].length; j++) {
                        // console.log("salary: ", allTeams[i][j].DraftKingsSalary);
                        teamSalary = teamSalary + allTeams[i][j].FanDuelSalary;
                        teamProjection = teamProjection + allTeams[i][j].FandDualProjection;
                    }
                    // console.log("teamProjection",teamProjection);
                    salaryArray[i] = teamSalary;
                    var ProjectionArray = {};
                    Object.assign(ProjectionArray, { teamnumber: i, teamvalue: teamProjection });
                    projArray.push(ProjectionArray);
                }

                let stringArray = allTeams.map(JSON.stringify);
                let uniqueStringArray = new Set(stringArray);
                allTeams = Array.from(uniqueStringArray, JSON.parse);

                projArray = projArray.sort((a, b) => b.teamvalue - a.teamvalue);

                let projectarrangeTeams = [];
                let projectposition = [];
                for (let i = 0; i < projArray.length; i++) {
                    projectposition.push(projArray[i].teamnumber);
                }

                // console.log("projectposition",projectposition);

                for (let i = 0; i < allTeams.length; i++) {
                    // console.log(projectposition[i]);
                    let newteam = allTeams[projectposition[i]];
                    projectarrangeTeams.push(newteam);
                }

                allTeams = projectarrangeTeams;

                var senddata = {
                    "status": 0,
                    "success": true,
                    "allTeams": allTeams,
                    "salaryArray": salaryArray,
                    "delay": 3000
                }

                const slatTeamData = {
                    Teams: totalteams,
                }
                await SlatPlayers.update({SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, slatTeamData, (error, doc) => {
                    if (error || !doc) {
                        console.log("mlb DB error : Slat data update error");
                    }
                    else {
                        console.log("mlb Teams data update");
                        socket.emit('mlbcreatebuild-success', senddata);
                    }
                })

                // socket.emit('mlbcreatebuild-success', allTeams,WR_Players,QB_Players,RB_Players,TE_Players,FLEX_Players,DST_Players);
                
                // console.log("allTeams: ", allTeams);
                // res.send({ status: 0, allTeams, salaryArray, B1_Players, B3_Players, OF_Players, B2_Players, SS_Players });
                // res.send({ PG_Players, SG_Players, PF_Players, SF_Players, G_Players, F_Players, UTIL_Players});

            })
    }
    catch (error) {
        console.log(error);
        var response = {
            status: 1, success: false, messages: "something went wrong"
        }
        socket.emit('mlbcreatebuild-success', response);
        // res.send({ error, status: 1, success: false, messages: "something went wrong" });
    }
}

module.exports.nextsocket_create_build_fandual_single = async function (io, socket, req) {
    try {
        let istest = await SlatPlayers.findOne({SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, { Players: 1, Teams: 1 });
        console.log("istest", istest.Teams.length)
        var AllTypePlayers = istest.Players[0];
        var AllTypeTeams = istest.Teams;


        let MVP_Players = AllTypePlayers.MVP;
        let excludePlayers = AllTypePlayers.Exclude;
        let lockedPlayers = AllTypePlayers.Lock;
        let exposurePlayer = {};
        if(AllTypePlayers.Exposure){
            exposurePlayer = AllTypePlayers.Exposure;
        }
        let complete = [];
        let allTeams = [];
        let teamArray = [];
        var currentdate = moment().tz("America/New_York").format('YYYY-MM-DDT00:00:00');

        let no_of_builds = 1500;
        let get_builds = req.NumberOfBuild;
        // let get_builds = 5;
        let fandualpositions = ["UTIL"];
        let positions = ["MVP", "STAR", "UTIL", "UTIL2", "UTIL3"];
        // let positions = ["G"];
        let SlateID = req.SlateID;
        let user = req.user;



        if (AllTypeTeams.length > 0) {
            allTeams = AllTypeTeams;
            get_builds = get_builds + AllTypeTeams.length;
            console.log(allTeams.length, AllTypeTeams.length, get_builds);
        }


        let LockedTeams = {};

        await PlayerPerTeam.find({ slatId: SlateID, user: user })
            .then(async teams => {
                // console.log("TEams ", teams);
                let teamStack = teams[0].teamStack;
                let teamStack_length = teamStack.length;
                for (let i = 0; i < teamStack_length; i++) {
                    // console.log("TEams ", teamStack[i].teamId);
                    if (teamStack[i].minNoOfPlayer > 0) {
                        LockedTeams[teamStack[i].teamId] = teamStack[i].minNoOfPlayer;
                    }
                }

            })
            .catch(error => {
                // console.log("player per team error");
            })


        let complete_team = 0;
        let count = 0;
        let reqsalary = 34000;
        let teamcreate = 0;
        let l = 1;
        for (let j = 0; j <= no_of_builds; j++) {
            let team = [];
            let teamCount = 1;
            // let complete_team = 0;
            let salary = 35000;
            for (let k = 0; k < positions.length; k++) {
                let position = positions[k];
                // console.log("position: ", position, " k: ", k, "j:", j);
                // let count =0;
                if (position === "MVP") {
                    MVP_Players = MVP_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));



                    // PG_Players = PG_Players.filter(val => !excludePlayers.includes(val));

                    MVP_Players = MVP_Players.sort((a, b) => {
                        return (b.FPPDfanduel - a.FPPDfanduel);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        return acc + item.FanDuelSalary;
                    }, 0);

                    let remainingplayer = positions.length - k;
                    // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                    let lastPlayerSal = (Math.abs(35000 - teamSalary) / remainingplayer);
                    // console.log("last player sal In PG: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    let playerCount = {};
                    for (let i = 0; i < length;) {
                        if (MVP_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);

                            if (lockedPlayers[i].LockPosition == 1) {

                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                if (j != 0) {
                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                    if (!playerCount) {
                                        playerCount = 0;
                                    }
                                    // console.log("playerexpo",playerexpo);
                                    // console.log("onlyCount",playerCount.count);
                                    if (playerCount.count <= playerexpo) {
                                        // console.log("enter");
                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                        i = length;
                                        continue;
                                    } else {
                                        // console.log("not enter");
                                        // sucess =  firstPLayer(teamArray, PG_Players, team, k, LockedTeams, position);
                                        // i = length;
                                        i++;
                                        continue;

                                    }

                                } else {
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                }
                            }
                            else {
                                // console.log("no");
                                i++;
                                continue;
                            }

                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("PG_sucessPlayers");

                        sucess = firstPLayer(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);

                    }

                    // console.log("sucess",sucess);

                }

                if (position === "STAR") {
                    MVP_Players = MVP_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    // SG_Players = SG_Players.filter(val => !excludePlayers.includes(val));

                    MVP_Players = MVP_Players.sort((a, b) => {
                        return (b.FPPDfanduel - a.FPPDfanduel);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.FanDuelSalary;
                    }, 0);

                    let remainingplayer = positions.length - k;
                    // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                    let lastPlayerSal = (Math.abs(35000 - teamSalary) / 4);

                    // console.log("last player sal In STAR: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    for (let i = 0; i < length;) {
                        if (MVP_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);

                            if (lockedPlayers[i].LockPosition == 2) {
                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                if (j != 0) {
                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                    if (!playerCount) {
                                        playerCount = 0;
                                    }
                                    // console.log("playerexpo",playerexpo);
                                    // console.log("onlyCount",playerCount.count);
                                    if (playerCount.count <= playerexpo) {
                                        // console.log("enter");
                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                        i = length;
                                        continue;
                                    } else {
                                        // console.log("not enter");
                                        // sucess =  addtolineup(teamArray, SG_Players, team, k, LockedTeams, position);
                                        // i = length;
                                        i++;
                                        continue;

                                    }

                                } else {
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                }
                            }
                            else {
                                // console.log("no");
                                i++;
                                continue;
                            }
                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("SG_sucessPlayers");
                        // console.log("PG_Players",PG_Players);
                        sucess = addtolineup(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);


                    }

                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);
                    }

                    // console.log("sucess",sucess);

                }

                if (position === "UTIL") {
                    MVP_Players = MVP_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    // SF_Players = SF_Players.filter(val => !excludePlayers.includes(val));

                    MVP_Players = MVP_Players.sort((a, b) => {
                        return (b.FPPDfanduel - a.FPPDfanduel);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.FanDuelSalary;
                    }, 0);

                    let remainingplayer = positions.length - k;
                    // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                    let lastPlayerSal = (Math.abs(35000 - teamSalary) / 3);

                    // console.log("last player sal In SF: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    for (let i = 0; i < length;) {
                        if (MVP_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                            if (lockedPlayers[i].LockPosition == 3) {
                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                if (j != 0) {
                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                    if (!playerCount) {
                                        playerCount = 0;
                                    }
                                    // console.log("playerexpo",playerexpo);
                                    // console.log("onlyCount",playerCount.count);
                                    if (playerCount.count <= playerexpo) {
                                        // console.log("enter");
                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                        i = length;
                                        continue;
                                    } else {
                                        // console.log("not enter");
                                        // sucess =  addtolineup(teamArray, SF_Players, team, k, LockedTeams, position);
                                        // i = length;
                                        i++;
                                        continue;

                                    }

                                } else {
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                }

                            }
                            else {
                                // console.log("no");
                                i++;
                                continue;
                            }
                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("SF_sucessPlayers");
                        // console.log("PG_Players",PG_Players);
                        if (lastPlayerSal > 7000) {
                            sucess = lastPlayer(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);
                        }
                        else {
                            sucess = addtolineup(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);
                        }
                        // sucess = addtolineup(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position,lockedPlayers);


                    }

                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);
                    }
                    // console.log("sucess",sucess);

                }

                if (position === "UTIL2") {
                    MVP_Players = MVP_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    // PF_Players = PF_Players.filter(val => !excludePlayers.includes(val));

                    MVP_Players = MVP_Players.sort((a, b) => {
                        return (b.FPPDfanduel - a.FPPDfanduel);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.DraftKingsSalary;
                    }, 0);

                    let remainingplayer = positions.length - k;
                    // console.log("remainingplayer: ", remainingplayer,"teamsalary",teamSalary);

                    let lastPlayerSal = (Math.abs(35000 - teamSalary) / 2);

                    // console.log("last player sal In UTIL2: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    for (let i = 0; i < length;) {
                        if (MVP_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                            if (lockedPlayers[i].LockPosition == 4) {
                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];
                                if (j != 0) {
                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                    if (!playerCount) {
                                        playerCount = 0;
                                    }
                                    // console.log("playerexpo",playerexpo);
                                    // console.log("onlyCount",playerCount.count);
                                    if (playerCount.count <= playerexpo) {
                                        // console.log("enter");
                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                        i = length;
                                        continue;
                                    } else {
                                        // console.log("not enter");
                                        // sucess =  addtolineup(teamArray, PF_Players, team, k, LockedTeams, position);
                                        // i = length;
                                        i++;
                                        continue;

                                    }

                                } else {
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    i = length;
                                    continue;
                                }

                            }
                            else {
                                // console.log("no");
                                i++;
                                continue;
                            }
                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }

                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("PF_sucessPlayers");
                        // console.log("PG_Players",PG_Players);
                        if (lastPlayerSal > 6500) {
                            sucess = lastPlayer(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);
                        }
                        else {
                            sucess = addtolineup(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);
                        }
                        // sucess = addtolineup(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position,lockedPlayers);

                    }

                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);
                    }

                    // console.log("sucess",sucess);

                }

                if (position === "UTIL3") {
                    MVP_Players = MVP_Players.filter(elm => !excludePlayers.map(elm => JSON.stringify(elm))
                        .includes(JSON.stringify(elm)));

                    // C_Players = C_Players.filter(val => !excludePlayers.includes(val));

                    MVP_Players = MVP_Players.sort((a, b) => {
                        return (b.FPPDfanduel - a.FPPDfanduel);
                    });

                    let teamSalary = team.reduce((acc, item) => {
                        // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                        return acc + item.FanDuelSalary;
                    }, 0);
                    let lastPlayerSal = (Math.abs(35000 - teamSalary));
                    // console.log("last player sal In UTIL3: ", lastPlayerSal);

                    let length = lockedPlayers.length;
                    let sucess = 0;
                    for (let i = 0; i < length;) {
                        if (MVP_Players.filter(item => item.PlayerID == lockedPlayers[i].PlayerID).length != 0 && teamArray.filter(item => item.PlayerId == lockedPlayers[i].PlayerID).length == 0) {
                            // console.log("yes",exposurePlayer[lockedPlayers[i].PlayerID]);
                            if (lockedPlayers[i].LockPosition == 5) {
                                let playerexpo = exposurePlayer[lockedPlayers[i].PlayerID];

                                if (j != 0) {
                                    playerCount = complete.find(item => item.id === lockedPlayers[i].PlayerID);
                                    if (!playerCount) {
                                        playerCount = 0;
                                    }
                                    // console.log("Sallary",lockedPlayers[i].DraftKingsSalary);
                                    // console.log("playerexpo",playerexpo);
                                    // console.log("onlyCount",playerCount.count);
                                    if (playerCount.count <= playerexpo) {
                                        // console.log("enter");
                                        sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                        i = length;
                                        continue;
                                    } else {
                                        // console.log("not enter");
                                        i++;
                                        continue;

                                    }

                                } else {
                                    sucess = includelockPLayer(teamArray, lockedPlayers[i], team, k, position);
                                    // console.log("sucess in lock",sucess);
                                    i = length;
                                    continue;
                                }

                            }
                            else {
                                // console.log("no");
                                i++;
                                continue;
                            }

                        }
                        else {
                            // console.log("no");
                            i++;
                        }
                    }


                    // console.log("sucess1",sucess);

                    if (sucess == 0) {
                        // console.log("C_sucessPlayers");
                        // console.log("PG_Players",PG_Players);
                        sucess = lastPlayer(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);


                    }
                    // console.log("sucess2",sucess);
                    if (sucess == null) {
                        // console.log("sucess second in SG",sucess);
                        sucess = randomplayer(teamArray, MVP_Players, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers);
                    }

                    // console.log("sucess",sucess);

                    // addtolineup(teamArray, C_Players, team, k,lastPlayerSal, position);
                    // console.log("in c");
                }

            }

            function includelockPLayer(teamArr, playerArr, team, k, position) {
                // console.log("lock");

                if (teamArr.filter(el => el.TeamID == playerArr.TeamID).length == 0) {
                    // console.log("Before update: 3");
                    teamArr.push({ PlayerId: playerArr.PlayerID });
                    teamArr.push({ TeamID: playerArr.TeamID, teamCount });
                }
                else {
                    // console.log("Before update: 4");
                    let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr.TeamID));
                    if (teamArr[objIndex].teamCount < 4) {
                        // console.log("Before update: 5");
                        teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                        teamArr.push({ PlayerId: playerArr.PlayerID });
                    }
                    else {
                        // console.log("Before update: 6");
                        return 0;
                    }
                }

                if (complete.filter(el => el.id == playerArr.PlayerID).length == 0) {
                    // console.log("Before update: 1");
                    count = 1;
                    let playerDataWithCount = {
                        id: playerArr.PlayerID,
                        TeamID: playerArr.TeamID,
                        count: count
                    }
                    complete.push(playerDataWithCount);
                }
                else {

                    // console.log("Before update: 2");
                    let objIndex = complete.findIndex((obj => obj.id == playerArr.PlayerID));
                    // console.log("Before update: ", complete[objIndex]);
                    complete[objIndex].count = complete[objIndex].count + 1;
                }

                team[k] = playerArr;
                return 1;
            }

            function firstPLayer(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers) {

                // console.log("lockedTeams: ", LockedTeams);
                // console.log("PlayerArray: ", teamArr); 
                let playerArr = [];

                if (LockedTeams) {
                    // array exists and is not empty
                    // console.log("lockedTeams: Last ", LockedTeams['9']);

                    for (const [key, value] of Object.entries(LockedTeams)) {
                        // console.log(key , value);
                        if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                            // console.log("yes:",);
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                            // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                            if (value > teamArr[objIndex].teamCount) {
                                // console.log("Teamid",key); 
                                // filter lock teams
                                let array1 = AllplayerArr.filter(obj => {

                                    // console.log("array :1 ", obj.TeamID); 
                                    return obj.TeamID == key
                                });
                                array1 = Object.assign(array1);
                                playerArr = playerArr.concat(array1);
                                // playerArr.push(array1);
                            }
                        } else {
                            // console.log("Teamid",key); 
                            let array1 = AllplayerArr.filter(obj => {

                                // console.log("array :1 ", obj.TeamID); 
                                return obj.TeamID == key
                            });
                            array1 = Object.assign(array1);
                            playerArr = playerArr.concat(array1);
                            // playerArr.push(array1);

                        }

                    }
                }


                // console.log("arrayfinal ", playerArr.length);

                if (playerArr.length == 0) {
                    playerArr = AllplayerArr;
                }

                playerArr = playerArr.sort((a, b) => {
                    return (b.FandDualProjection - a.FandDualProjection)
                })

                // console.log("arrayfinal ", playerArr);

                // let addlastPlayerSal = lastPlayerSal - 500;

                let length = playerArr.length - 1;
                for (let i = 0; i < length;) {
                    let n = Math.floor(Math.random() * Math.floor(2));
                    // console.log("teamId: ", n,playerArr[n].FandDualProjection,playerArr[n].FanDualVal);
                    let lockutil = 0;
                    if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0 && playerArr[n].FandDualProjection >= 3 && playerArr[n].FanDualVal >= 1) {

                        for (let l = 0; l < lockedPlayers.length;) {
                            if (playerArr[n].PlayerID === lockedPlayers[l].PlayerID) {
                                l = lockedPlayers.length;
                                lockutil = 1;
                            } else {
                                l++;
                            }
                        }

                        if (lockutil === 1) {
                            i++;
                            continue;
                        }

                        if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                            teamArr.push({ PlayerId: playerArr[n].PlayerID });
                            teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                        }
                        else {
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                            }
                            else {
                                i++;
                                continue;
                            }
                        }

                        if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                            count = 1;
                            let playerDataWithCount = {
                                id: playerArr[n].PlayerID,
                                TeamID: playerArr[n].TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {
                            let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }

                        salary = salary - playerArr[n].FanDuelSalary;
                        team[k] = playerArr[n];
                        i = length;
                        // console.log("in compare team: ", team);
                        return 1;
                    }
                    else {
                        i++;
                    }
                }
            }

            function addtolineup(teamArr, AllplayerArr, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers) {

                // console.log("lockedTeams: add to line up", LockedTeams);
                // console.log("PlayerArray: ", teamArr); 
                // console.log("Add to line up: ");

                let playerArr = [];
                let playerlength = 0

                if (LockedTeams) {
                    // array exists and is not empty
                    // console.log("lockedTeams: Last ", LockedTeams['9']);

                    for (const [key, value] of Object.entries(LockedTeams)) {
                        // console.log(key , value);
                        // console.log("teamArr.length: ", teamArr.length); 
                        // console.log("teamArr.filter(el => el.TeamID == key).length: ", teamArr.filter(el => el.TeamID == key).length); 
                        if (teamArr.length > 0 && teamArr.filter(el => el.TeamID == key).length != 0) {
                            // console.log("yes:1",);
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == key));
                            // console.log("resultA:2",teamArr[objIndex].teamCount,"value",value); 
                            if (value > teamArr[objIndex].teamCount) {
                                // console.log("Teenter",key); 
                                // filter lock teams
                                let array1 = AllplayerArr.filter(obj => {

                                    // console.log("array :1 ", obj.TeamID); 
                                    return obj.TeamID == key
                                });

                                array1 = Object.assign(array1);
                                playerArr = playerArr.concat(array1);
                                // playerArr.push(array1);
                            }
                        } else {
                            // console.log("yes:2",);
                            // console.log("Teamid",key); 
                            let array1 = AllplayerArr.filter(obj => {

                                // console.log("array :1 ", obj.TeamID); 
                                return obj.TeamID == key
                            });
                            array1 = Object.assign(array1);
                            playerArr = playerArr.concat(array1);
                            // playerArr.push(array1);

                        }

                    }
                }

                // console.log("arrayfinal before", playerArr.length);

                if (playerArr.length == 0) {
                    playerArr = AllplayerArr;
                }

                // console.log("arrayfinal ", playerArr.length);

                let addlastPlayerSal = lastPlayerSal - 4000;
                let endlastPlayerSal = lastPlayerSal + 1000;

                // console.log("addlastPlayerSal ", addlastPlayerSal);

                let length = playerArr.length + 30;
                if (playerArr.length > 20) {
                    playerlength = 19;
                } else {
                    playerlength = playerArr.length - 1;
                }
                // console.log("playerlength",playerlength,playerArr.length);
                for (let i = 0; i < length;) {

                    let n = Math.floor(Math.random() * Math.floor(playerlength));
                    // console.log("teamId: ", playerArr[n].TeamID);
                    // console.log("position: ", n);
                    // console.log("salary: ",n, playerArr[n].FanDuelSalary,playerArr[n].FandDualProjection,playerArr[n].FanDualVal);

                    let lockutil = 0;

                    if (teamArr.filter(item => item.PlayerId == playerArr[n].PlayerID).length == 0
                        && endlastPlayerSal >= playerArr[n].FanDuelSalary
                        && addlastPlayerSal <= playerArr[n].FanDuelSalary && playerArr[n].FandDualProjection >= 3 && playerArr[n].FanDualVal >= 1) {
                        // console.log("position: enter3 ");

                        for (let l = 0; l < lockedPlayers.length;) {
                            // console.log("lockutil",lockedPlayers[l].PlayerID,playerArr[n].PlayerID);
                            if (playerArr[n].PlayerID == lockedPlayers[l].PlayerID) {
                                // console.log("lockutil11111");
                                l = lockedPlayers.length;
                                lockutil = 1;
                            } else {
                                // console.log("lockutil222222");
                                l++;
                            }
                        }

                        // console.log("lockutil",lockutil);

                        if (lockutil === 1) {
                            i++;
                            continue;
                        }

                        if (teamArr.filter(el => el.TeamID == playerArr[n].TeamID).length == 0) {
                            // console.log("position: 3 ");
                            teamArr.push({ PlayerId: playerArr[n].PlayerID });
                            teamArr.push({ TeamID: playerArr[n].TeamID, teamCount });
                        }
                        else {
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[n].TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                // console.log("position: 4 ");
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: playerArr[n].PlayerID });
                            }
                            else {
                                // console.log("position: 5 ");
                                i++;
                                continue;
                            }
                        }

                        if (complete.filter(el => el.id == playerArr[n].PlayerID).length == 0) {
                            // console.log("position: 1 ");
                            count = 1;
                            let playerDataWithCount = {
                                id: playerArr[n].PlayerID,
                                TeamID: playerArr[n].TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {
                            // console.log("position: 2 ");
                            let objIndex = complete.findIndex((obj => obj.id == playerArr[n].PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }


                        // salary = salary - playerArr[n].DraftKingsSalary;
                        team[k] = playerArr[n];
                        i = length;
                        // console.log("in compare team: ", team);
                        return 1;
                    }
                    else {
                        i++;
                    }
                }
            }

            function randomplayer(teamArr, playerArr, team, k, LockedTeams, lastPlayerSal, position, lockedPlayers) {

                // console.log("Random: ");
                let addlastPlayerSal = lastPlayerSal - 500;

                resultA = playerArr.sort((a, b) => {
                    return (a.DraftKingsSalary - b.DraftKingsSalary)
                })

                let length = playerArr.length - 1;
                for (let i = 0; i < length;) {
                    // let n = Math.floor(Math.random() * Math.floor(length));
                    // console.log("teamId: ", playerArr[n].TeamID);
                    // console.log("position: ", n);
                    // console.log("salary: ", playerArr[i].DraftKingsSalary);

                    let lockutil = 0;

                    if (teamArr.filter(item => item.PlayerId == playerArr[i].PlayerID).length == 0
                        && addlastPlayerSal <= playerArr[i].FanDuelSalary
                        && playerArr[i].FandDualProjection >= 3) {
                        // console.log("position: enter3 ");

                        for (let l = 0; l < lockedPlayers.length;) {
                            if (playerArr[i].PlayerID === lockedPlayers[l].PlayerID) {
                                l = lockedPlayers.length;
                                lockutil = 1;
                            } else {
                                l++;
                            }
                        }

                        if (lockutil === 1) {
                            i++;
                            continue;
                        }

                        if (teamArr.filter(el => el.TeamID == playerArr[i].TeamID).length == 0) {
                            // console.log("position: 3 ");
                            teamArr.push({ PlayerId: playerArr[i].PlayerID });
                            teamArr.push({ TeamID: playerArr[i].TeamID, teamCount });
                        }
                        else {
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == playerArr[i].TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                // console.log("position: 4 ");
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: playerArr[i].PlayerID });
                            }
                            else {
                                // console.log("position: 5 ");
                                i++;
                                continue;
                            }
                        }

                        if (complete.filter(el => el.id == playerArr[i].PlayerID).length == 0) {
                            // console.log("position: 1 ");
                            count = 1;
                            let playerDataWithCount = {
                                id: playerArr[i].PlayerID,
                                TeamID: playerArr[i].TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {
                            // console.log("position: 2 ");
                            let objIndex = complete.findIndex((obj => obj.id == playerArr[i].PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }


                        // salary = salary - playerArr[n].DraftKingsSalary;
                        team[k] = playerArr[i];
                        i = length;
                        // console.log("in compare team: ", team);
                        return 1;
                    }
                    else {
                        i++;
                    }
                }
            }

            function lastPlayer(teamArr, playerArr, team, k, LockedTeams, lastPlayerSal, position) {

                // console.log("resultA: LAst ");
                // let resultA = playerArr.filter(elm => !teamArr.map(elm => JSON.stringify(elm))
                //     .includes(JSON.stringify(elm)));

                // let resultPLayerA= playerArr.filter(function(cv){
                //     return !teamArr.find(function(e){
                //         return e.PlayerId == cv.PlayerID;
                //     });
                // });

                resultA = playerArr.sort((a, b) => {
                    return (b.FanDuelSalary - a.FanDuelSalary)
                })
                // console.log("resultA: ",resultA.length);
                let length = resultA.length - 1;
                // console.log("resultA: ",teamCount);
                for (let l = 0; l <= length;) {
                    // console.log("teamId: ", resultA[l].TeamID);
                    // console.log("result inside l: ",resultA[l]);
                    // console.log("result Sallary l: ",l,resultA[l].FanDuelSalary,resultA[l].FandDualProjection);

                    if (teamArr.filter(item => item.PlayerId == resultA[l].PlayerID).length == 0
                        && lastPlayerSal >= resultA[l].FanDuelSalary
                        && resultA[l].FandDualProjection >= 3) {

                        if (teamArr.filter(el => el.TeamID == resultA[l].TeamID).length == 0) {
                            // console.log("resultA: 3");
                            teamArr.push({ PlayerId: resultA[l].PlayerID });
                            teamArr.push({ TeamID: resultA[l].TeamID, teamCount });
                        }
                        else {
                            let objIndex = teamArr.findIndex((obj => obj.TeamID == resultA[l].TeamID));
                            if (teamArr[objIndex].teamCount < 4) {
                                // console.log("resultA: 4");
                                teamArr[objIndex].teamCount = teamArr[objIndex].teamCount + 1;
                                teamArr.push({ PlayerId: resultA[l].PlayerID });
                            }
                            else {
                                // console.log("resultA: 5");
                                l++;
                                continue;
                            }
                        }

                        if (complete.filter(el => el.id == resultA[l].PlayerID).length == 0) {
                            // console.log("resultA: 1");
                            count = 1;
                            let playerDataWithCount = {
                                id: resultA[l].PlayerID,
                                TeamID: resultA[l].TeamID,
                                count: count
                            }
                            complete.push(playerDataWithCount);
                        }
                        else {
                            // console.log("resultA: 2");
                            let objIndex = complete.findIndex((obj => obj.id == resultA[l].PlayerID));
                            // console.log("Before update: ", complete[objIndex]);
                            complete[objIndex].count = complete[objIndex].count + 1;
                        }


                        // salary = salary - playerArr[l].DraftKingsSalary;
                        // console.log("teamArr: ",teamArr);
                        team[k] = resultA[l];
                        // console.log("in compare team: ", team);
                        l = length;

                        return 1;

                    }
                    else {
                        l++;
                        continue;
                    }
                }
            }

            // console.log("team: ", team);
            // console.log("complete: ",complete);
            // console.log("teamarray: ", teamArray);
            teamArray = [];

            let teamSalary = team.reduce((acc, item) => {
                // console.log("item.DraftKingsSalary: ", item.DraftKingsSalary);
                return acc + item.FanDuelSalary;
            }, 0);

            // console.log("team salary", teamSalary);
            // console.log("complete team dgsdgsdgfdshfsdddddddfdhgggggggdgdgsgsdgsdg", team.length);

            let getbuild = l * 30;
            if (j == getbuild) {
                //    // console.log(getbuild,"team",j,complete_team,teamcreate,reqsalary);
                if (complete_team > teamcreate) {
                    reqsalary = reqsalary;
                    teamcreate = complete_team;
                } else {
                    reqsalary = reqsalary - 500;
                    teamcreate = complete_team;
                }
                l = l + 1;
            }

            if (teamSalary <= 35000 && teamSalary >= reqsalary) {
                // console.log("aeraea team salary", teamSalary);
                // let fanteam = team.reverse();
                allTeams.push(team);

                let stringArray = allTeams.map(JSON.stringify);
                let uniqueStringArray = new Set(stringArray);
                allTeams = Array.from(uniqueStringArray, JSON.parse);

                complete_team = allTeams.length;

                for (const [key, value] of Object.entries(exposurePlayer)) {
                    // console.log(key, value);
                    let newplayerCount = complete.find(item => item.id === key);
                    if (newplayerCount)
                        if (value === newplayerCount.count) {
                            exposurePlayer[key] = 0;
                            delete exposurePlayer[key];
                        }
                }

            } else {

                for (const [key, value] of Object.entries(exposurePlayer)) {
                    // console.log(key, value);
                    exposurePlayer[key] = value + 1;
                }
                // console.log("Exposure players array: ", exposurePlayer);
            }
            // console.log("complete_team: ", complete_team);
            // console.log("get_builds: ", get_builds);
            if (complete_team == get_builds) {
                j = no_of_builds + 1;
            }
        }

        var totalteams = allTeams;
        // console.log("totalteams length", totalteams.length);
        const slatTeamData = {
            Teams: totalteams,
        }
        await SlatPlayers.updateOne({SportType: "MLB", SportId: "2", SlatID: req.SlateID, UserId: req.user }, slatTeamData, async (error, doc) => {
            if (error || !doc) {
                console.log("mlb DB error : Slat data update error");
            }
            else {
                console.log("mlb Teams data update");

                allTeams = allTeams.slice(-req.NumberOfBuild);

                let salaryArray = [];
                let projArray = [];
                for (let i = 0; i < allTeams.length; i++) {
                    let teamSalary = 0;
                    let teamProjection = 0;
                    for (let j = 0; j < allTeams[i].length; j++) {
                        // console.log("salary: ", allTeams[i][j].DraftKingsSalary);
                        teamSalary = teamSalary + allTeams[i][j].FanDuelSalary;
                        teamProjection = teamProjection + allTeams[i][j].FandDualProjection;
                    }
                    // console.log("teamProjection",teamProjection);
                    salaryArray[i] = teamSalary;
                    var ProjectionArray = {};
                    Object.assign(ProjectionArray, { teamnumber: i, teamvalue: teamProjection });
                    projArray.push(ProjectionArray);
                }

                let stringArray = allTeams.map(JSON.stringify);
                let uniqueStringArray = new Set(stringArray);
                allTeams = Array.from(uniqueStringArray, JSON.parse);

                projArray = projArray.sort((a, b) => b.teamvalue - a.teamvalue);

                let projectarrangeTeams = [];
                let projectposition = [];
                for (let i = 0; i < projArray.length; i++) {
                    projectposition.push(projArray[i].teamnumber);
                }

                // console.log("projectposition",projectposition);

                for (let i = 0; i < allTeams.length; i++) {
                    // console.log(projectposition[i]);
                    let newteam = allTeams[projectposition[i]];
                    projectarrangeTeams.push(newteam);
                }

                allTeams = projectarrangeTeams;

                var senddata = {
                    "status": 0,
                    "success": true,
                    "allTeams": allTeams,
                    "salaryArray": salaryArray,
                    "delay": 1000
                }
                // socket.emit('mlbcreatebuild-success', allTeams,WR_Players,QB_Players,RB_Players,TE_Players,FLEX_Players,DST_Players);
                socket.emit('mlbcreatebuild-success', senddata);
                // console.log("allTeams: ", allTeams);
                // res.send({ status: 0, allTeams, salaryArray, B1_Players, B3_Players, OF_Players, B2_Players, SS_Players });
                // res.send({ PG_Players, SG_Players, PF_Players, SF_Players, G_Players, F_Players, UTIL_Players});
            }
        })

    }
    catch (error) {
        console.log(error);
        var response = {
            status: 1, success: false, messages: "something went wrong"
        }
        socket.emit('mlbcreatebuild-success', response);
        // res.send({ error, status: 1, success: false, messages: "something went wrong" });
    }
} 

