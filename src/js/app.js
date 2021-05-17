App = {
  web3Provider: null,
  contracts: {},
  //account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545');
    }
    // App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  render: function() {
    var gradingInstance;
    var loader = $("#loader");
    var adminContent = $("#adminContent");
    var teacherContent = $("#teacherContent");
    var studentContent = $("#studentContent");
    
    $("#pleaserefresh").hide();
    loader.show();
    adminContent.hide();
    teacherContent.hide();
    studentContent.hide();
  
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Public Key: " + account);
      }
    });

    // Load contract data
    App.contracts.Grading.deployed().then(function(instance) {
      gradingInstance = instance;
      return gradingInstance.admin();
    }).then(function(adminAddr) {
      // check if admin/teacher/student
      var accountAddr = App.account;
      console.log("Admin Addr: " + adminAddr);
      console.log("Account Addr: " + accountAddr);
      if (accountAddr == adminAddr){
        // Show teachers
        var teachersAdminTable = $("#teachersAdminTable");
        teachersAdminTable.empty();
        gradingInstance.teachersCount().then(function(teachersCount) {
          console.log("Num Teachers: " + teachersCount);
          for (var i=0; i<teachersCount; i++) {
            gradingInstance.teachersList(i).then(function(addr) {
              var addressT = addr;
              gradingInstance.teachers(addr).then(function(teacher) {
                console.log(addressT + " " + teacher[1]);
                var teacherTemplate = "<tr><td>" + addressT + "</td><td>" + teacher[1] + "</td></tr>";
                teachersAdminTable.append(teacherTemplate);
              });
            });
          }
          if (teachersCount == 0) {
            $("#adminTeachersList").hide();
          } else {
            $("#adminTeachersList").show();
          }
        });
        // Show students
        var studentsAdminTable = $("#studentsAdminTable");
        studentsAdminTable.empty();
        gradingInstance.studentsCount().then(function(studentsCount) {
          console.log("Num Studs: " + studentsCount);
          for (var i=0; i<studentsCount; i++) {
            gradingInstance.studentsList(i).then(function(addr) {
              var addressStud = addr;
              gradingInstance.students(addr).then(function(student) {
                console.log(addressStud + " " + student[1] + " " + student[2]);
                var studentTemplate = "<tr><td>" + addressStud + "</td><td>" + student[1] + "</td><td>" + student[2] + "</td></tr>";
                studentsAdminTable.append(studentTemplate);
              });
            });
          }
          if (studentsCount == 0) {
            $("#adminStudentsList").hide();
          } else {
            $("#adminStudentsList").show();
          }
        });
        loader.hide();
        adminContent.show();
      }
      return gradingInstance.isTeacherAdded(App.account);
    }).then(function(isTeacher) {
      if (isTeacher) {
        var rollNumberSelect = $('#studentRollSelectTeacher');
        rollNumberSelect.empty();
        gradingInstance.studentsCount().then(function(studCount) {
          console.log("Num Studs: " + studCount);
          for(var i=0; i<studCount; i++) {
            gradingInstance.studentsList(i).then(function(addr) {
              var addressStud = addr;
              gradingInstance.students(addr).then(function(student) {
                gradingInstance.getGrade(addr, App.account, {from: App.account}).then(function(grade) {
                  if (grade == "") {
                    var id = student[0];
                    var roll_number = student[1];
                    console.log(id + " " + roll_number);
                    var rollOption = "<option value='" + id + "' >" + roll_number + "</ option>";
                    rollNumberSelect.append(rollOption);
                  }
                });
              });
            });
          }
        });
        // Show students grades in table
        var studentsTeacherTable = $("#studentsTeacherTable");
        studentsTeacherTable.empty();
        gradingInstance.studentsCount().then(function(studentsCount) {
          console.log("Num Studs: " + studentsCount);
          for (var i=0; i<studentsCount; i++) {
            gradingInstance.studentsList(i).then(function(addr) {
              var studAddr = addr;
              gradingInstance.students(addr).then(function(student) {
                var studDetails = student;
                gradingInstance.getGrade(studAddr, App.account, { from: App.account }).then(function(grade) {
                  if (grade != "") {
                    var studentTemplate = "<tr><td>" + studDetails[1] + "</td><td>" + grade + "</td></tr>";
                    console.log(studDetails[1] + " " + grade);
                    studentsTeacherTable.append(studentTemplate);
                  }
                });
              });
            });
          }
          if (studentsCount == 0) {
            $("#teacherStudentsList").hide();
          } else {
            $("#teacherStudentsList").show();
          }
        });
        loader.hide();
        teacherContent.show();
      }
      return gradingInstance.isStudAdded(App.account);
    }).then(function(isStudent) {
      if (isStudent) {
        var studentGradesTable = $("#studentGradesTable");
        studentGradesTable.empty();
        $("#notGradedStudent").show();
        $("#gradedStudent").hide();
        gradingInstance.students(App.account).then(function(student) {
          var studDetails = student;
          gradingInstance.teachersCount().then(function(numTeachers) {
            for (var i=0; i<numTeachers; i++) {
              gradingInstance.teachersList(i).then(function(addr) {
                var addressT = addr;
                gradingInstance.teachers(addr).then(function(teacher) {
                  gradingInstance.getGrade(App.account, addressT, { from: App.account }).then(function(grade) {
                    if (grade != "") {
                      var studentGradeTemplate = "<tr><td>" + teacher[1] + "</td><td>" + grade + "</td></tr>";
                      console.log(teacher[1] + " " + grade);
                      studentGradesTable.append(studentGradeTemplate);
                      $("#notGradedStudent").hide();
                      $("#gradedStudent").show();
                    }
                  });
                });
              });
            }
          });
          
        });
        loader.hide();
        studentContent.show();
      }
    }).catch(function(error) {
      console.warn(error);
    });
  

  },

  addTeacher: function() { 
    var teacherAddr = $('#teacherAddressAdmin').val();
    var teacherCourse = $('#teacherCourseAdmin').val();
    console.log("Adding teacher:- Addr: " + teacherAddr);
    App.contracts.Grading.deployed().then(function(instance) {
      return instance.addTeacher(teacherAddr, teacherCourse, { from: App.account });
    }).then(function(result) {
      // Wait for teacher to be added
      $("#pleaserefresh").show();
      $("#adminContent").hide();
      $("#teacherContent").hide();
      $("#studentContent").hide();
    }).catch(function(err) {
      console.error(err);
    });
  },

  addStudent: function() { 
    var studentAddr = $('#studentAddressAdmin').val();
    var studentRoll = $('#studentRollAdmin').val();
    var studentName = $('#studentNameAdmin').val();
    console.log("Adding student:- Addr: " + studentAddr);
    console.log("Adding student:- Roll: " + studentRoll);
    console.log("Adding student:- Name: " + studentName);
    App.contracts.Grading.deployed().then(function(instance) {
      return instance.addStudent(studentAddr, studentRoll, studentName, { from: App.account });
    }).then(function(result) {
      // Wait for student to be added
      $("#pleaserefresh").show();
      $("#adminContent").hide();
      $("#teacherContent").hide();
      $("#studentContent").hide();
    }).catch(function(err) {
      console.error(err);
    });
  },

  gradeStudent: function() {
    var idSelect = $('#studentRollSelectTeacher').val();
    var gradeSelect = $('#gradeSelectTeacher').val();
    console.log(idSelect + " -> " + gradeSelect);
    App.contracts.Grading.deployed().then(function(instance) {
      gradingInstance = instance;
      gradingInstance.studentsList(parseInt(idSelect)-1).then(function(addr) {
        return instance.addGrade(addr, gradeSelect, { from: App.account });
      });
    }).then(function(result) {
      $("#pleaserefresh").show();
      $("#adminContent").hide();
      $("#teacherContent").hide();
      $("#studentContent").hide();
    }).catch(function(err) {
      console.error(err);
    });
  },

  // castVote: function() {
  //   var candidateId = $('#candidatesSelect').val();
  //   App.contracts.Grading.deployed().then(function(instance) {
  //     return instance.vote(candidateId, { from: App.account });
  //   }).then(function(result) {
  //     // Wait for votes to update
  //     $("#content").hide();
  //     $("#loader").show();
  //   }).catch(function(err) {
  //     console.error(err);
  //   });
  // },

  listenForEvents: function() {
    App.contracts.Grading.deployed().then(function(instance) {
      instance.addedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // App.render();
      });
    });
  },

  initContract: function() {
    $.getJSON("Grading.json", function(grading) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Grading = TruffleContract(grading);
      // Connect provider to interact with contract
      App.contracts.Grading.setProvider(App.web3Provider);
  
      App.listenForEvents();
  
      return App.render();
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});