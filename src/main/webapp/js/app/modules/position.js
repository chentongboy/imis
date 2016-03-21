/*
 * Created by William Zhang 18/02/16
 */

    define(['jquery', 'bootstrap', 'handlebars', 'validate', 'ajaxHandler',
            'jqueryForm', 'formValidator', 'additionalMethods', 'custom', 'eventHandler',
            'jDataTables', 'imis'],
        function($, bootstrap, handlebars, validate, ajaxHandler,
                 jqueryForm, formValidator, additionalMethods, custom, eventHandler,
                 jDataTables, imis) {

            "use strict";

            var position = {};
            
            var editor;

            position.View = {
            	
            	positionSelectByEmployer : function() {
	            	$('#positionTest tbody').on( 'click', 'tr', function () {
	                        if ( $(this).hasClass('selected') ) {
	                            $(this).removeClass('selected');
	                        }
	                        else {
	                        	$('#positionTest').DataTable().$('tr.selected').removeClass('selected');
	                            $(this).addClass('selected');
	                        }
	                } );
            	},
            	
            	getPositionGroupView : function(options) {
        				var positionGroupSelect = $('#positionGroupSelect');
        				$('#positionGroupSelect' + ' option').remove();

        				for (var i = 0; i < options.length; i++) {

        					var optionText = options[i].positionGroupName;
        					var optionValue = options[i].positionGroupId;

        					var option = "<option value=" + optionValue + ">"
        							+ optionText + "</option>";
        					positionGroupSelect.append(option);
        				}
        	     },
        	     positionSelectByAdmin : function() {
        	     
        	      $('#adminPositionTest tbody').on( 'click', 'tr', function () {
                            if ( $(this).hasClass('selected') ) {
                                $(this).removeClass('selected');
                            }
                            else {
                            	$('#adminPositionTest').DataTable().$('tr.selected').removeClass('selected');
                                $(this).addClass('selected');
                            }
                        } );
        	     
        	     },
        	     			 
        			
        			positionFormSubmit : $("#positionForm_submit")
        		};

            position.Controller = {
            	getPositionGroup : function() {
        				$.ajax({
        					type : "get",
        					dataType : "json",
        					url : 'getPositionGroup',
        					success : function(data) {
        						position.View.getPositionGroupView(data);
        					}
        				});
        			},
        			 exportPositionCSV : function(){
     	                $.ajax({
     	 	                        type : "post",
     	 	                        dataType : "json",
     	 	                        url : "exportPositionCSV",
     	 	                        success : function(data) {
     	 	                            location.href = "downloadCsv?csvFileName=" + data.models.fileName;
     	 	                        }
     	 	                });
     	                  },
        			handleFormSubmit : function() {
        				$("#positionForm").submit();
        			},
        			
        			addDisplay: function(){ 
            		 var positionTable=document.getElementById("positionTable");
 				       var addForm=document.getElementById("addForm");
 				        if(positionTable.style.display=="none"){
 				        	addForm.style.display="none";
 				        	positionTable.style.display="";
 				        }else{
 				        	positionTable.style.display="none";
 				        	addForm.style.display="";
 				      }
            		 },
            		 
            		 loadPostionStatusList : function() {
            		    var groupId = $('#employerGroup').find("option:selected").val();
                	    var positionStatus = $('#positionStatus').find("option:selected").val();
            		 
            		 	$('#example').DataTable({
				        ajax:  {
				        	"url" : "getPostionStatusList",
				        	"type" : "post",
				        	"data" : {"groupId" : groupId, "positionStatus" : positionStatus}
				        	//"dataSrc": "data"
				        },
				        columns: [
				            { data: "positionName" },
				            { data: "employer.employerName" },
				            { data: null, render: 
				                function ( data, type, row ) {
					            	var result;
					            	
					            	if (data.application == null)
					            		result = 'New'; 
					            	else if (data.application.applicationStatus == 1)
					                	result = 'Requested';
					                else if (data.application.applicationStatus == 2)
					                	result = 'Success';
					                else if (data.application.applicationStatus == 3)
					                    result = 'Regected';
					                return result;
				                }  
				            }
				            
				        ],
				        rowCallback : function(row, data) {
				        	$('td:eq(0)', row).html('<a href=positionDetail?positionId='+ data.positionId + '>' + data.positionName + '</a >');
				        },
				        select: true
				       } );
            		 
            		 },
            		 
            		 loadPositionByEmployer : function() {
            		 
            		 	$('#positionTest').DataTable({
			        ajax:  {
			        	"url" : "showPosition",
			        	"type" : "get",
			        	//"data" : {"groupId" : groupId, "positionStatus" : positionStatus}
			        },
			        columns: [
			            { data: "positionId" },
			            { data: "positionName" },
			            { data: "positionGroup.positionGroupName" },
			            { data:null,render:function(data){
			            	function add0(m){return m<10?'0'+m:m };
			            	var time = new Date(data.updateTime);
			            	var y = time.getFullYear();
			            	var m = time.getMonth()+1;
			            	var d = time.getDate();
			            	var h = time.getHours();
			            	var mm = time.getMinutes();
			            	var s = time.getSeconds();
			            	return y+'-'+add0(m)+'-'+add0(d)+' '+add0(h)+':'+add0(mm)+':'+add0(s);
		            	}
		            },
			            { data: "unreadApplicationNum" },
			            { data: "unreadApplicationNum" },
			        ],
			        "rowCallback": function(row, data) { //data是后端返回的数据
			              $('td:eq(1)', row).html('<a href=positionDetail?positionId='+ data.positionId + '>' + data.positionName + '</a>');
			              $('td:eq(4)', row).html('<a href=candidate?positionId='+ data.positionId + '>' + data.unreadApplicationNum+'/'+data.applicationNum + '</a>');
			              $('td:eq(5)', row).html('<a href=javascript:void(0) onclick=delPositionRow()>delete</a>');
			        },
			        "order": [[ 3, "desc" ]],
			        select: true
			    } );
            		 
            		 },
            		 
            		 loadPositionByAdmin : function() {
            		 	$('#adminPositionTest').DataTable({
    			        ajax:  {
    			        	"url" : "showPosition",
    			        	"type" : "get",
    			        	//"data" : {"groupId" : groupId, "positionStatus" : positionStatus}
    			        },
    			        columns: [
    			            { data: "positionId" },
    			            { data: "positionName" },
    			            { data: "positionGroup.positionGroupName" },
    			            { data: "employer.employerName" },
    			            { data:null,render:function(data){
    			            	function add0(m){return m<10?'0'+m:m };
    			            	var time = new Date(data.updateTime);
    			            	var y = time.getFullYear();
    			            	var m = time.getMonth()+1;
    			            	var d = time.getDate();
    			            	var h = time.getHours();
    			            	var mm = time.getMinutes();
    			            	var s = time.getSeconds();
    			            	return y+'-'+add0(m)+'-'+add0(d)+' '+add0(h)+':'+add0(mm)+':'+add0(s);
    		            	}
    		            },
    		            { data: "positionId" },
    			        ],
    			        "rowCallback": function(row, data) { //data是后端返回的数据
    			              $('td:eq(1)', row).html('<a href=positionDetail?positionId='+ data.positionId + '>' + data.positionName + '</a>');
    			              $('td:eq(5)', row).html('<a href=javascript:void(0) onclick=delAdminPositionRow()>delete</a>');
    			        },
    			        "order": [[ 0, "asc" ]],
    			        select: true
    			    } );
            		 
            		 
            		 }
            		 
            		 
            		 
            		 
        		};
            

            function registerEventListener() {
                /*$("#positionApplicationTab").click(function(){
                	application.Controller.loadPostionStatusList();
                });*/
                
                /*$('#searchPosition').click(function(){
                	application.Controller.loadPostionStatusList();
                });*/
                
                position.Controller.loadPostionStatusList();
                position.Controller.getPositionGroup();
                position.Controller.loadPositionByAdmin();
                position.Controller.loadPositionByEmployer();
                
                position.View.getPositionGroupView();
                position.View.positionSelectByEmployer();
                
                
                $("#submitPosition").click(function() {
                	$("#myModalTrigger3").click();
    			});
                $("#confirmSubmit").click(function(){
                	position.Controller.handleFormSubmit();
                });
                $('#deleteLink').click( function () {
                	positionShow.Controller.deletePosition();
                } );
                $('#addDisplay').click( function () {
                	positionShow.Controller.addDisplay();
                } );
                $('#addDisplay2').click( function () {
                	positionShow.Controller.addDisplay();
                } );
                $('#exportPositionCSV').click(function(){
                	positionForm.Controller.exportPositionCSV();
	            });
            }
                
            
            $(function() {
                registerEventListener();
            });


    imis.position = position;
    return position;

});
