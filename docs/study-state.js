export const initialStudyOptions = [{material:0,gate:false,wheelchair:false,hazard:false,replay:0},{material:0,reference:false,meeting:false,open:false,discuss:false,speaker:0,gather:0},{support:true,execute:true,commandAt:-100},{precise:true,commercial:true,chamber:false,service:0},{reuse:false,waste:0,trips:0,returned:0,phase:0,actionAt:-100},{era:0,exchanged:false,bought:false,status:true},{stage:0}];
Object.assign(initialStudyOptions[0],{aiCase:'',aiVersion:1,processMode:0,processChallenge:false,doorStage:0});
Object.assign(initialStudyOptions[2],{aiCase:'',aiVersion:1,workMode:0});
Object.assign(initialStudyOptions[5],{aiCase:'',aiVersion:1,hypeMode:0,hypeRepair:true});
// Proposal exploration is independent from the final choices and their identity mapping.
import {initialProposal,proposalUnits} from './proposal-content.js';
for(const unit of proposalUnits)Object.assign(initialStudyOptions[unit],{proposalActive:false,proposalState:initialProposal(unit)});
