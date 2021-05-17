pragma solidity ^0.5.16;

contract Grading {
    
    /* -------------------------- VARIABLES ----------------------------- */
    
    // Model a Student
    struct Student {
        uint id;
        string roll_number;
        string name;
        // Mapping (Teacher address => grade)
        mapping(address => string) grades;
    }

    // Model a Teacher
    struct Teacher {
        uint id;
        string course;
    }

    address public admin;
    
    // List of all students
    address[] public studentsList;
    // Map containing all students
    mapping(address => Student) public students;
    // Map to check that a student exists or not
    mapping(address => bool) public isStudAdded;
    // Store students count
    uint public studentsCount;

    // List of all teachers
    address[] public teachersList;
    // Map containing all teachers
    mapping(address => Teacher) public teachers;
    // Map to check that a student exists or not
    mapping(address => bool) public isTeacherAdded;
    // Store teachers count
    uint public teachersCount;

    /* ---------------- CONSTRUCTOR, MODIFIER AND EVENTS ---------------- */
    
    constructor() public {
        admin = msg.sender;
    }

	modifier onlyOwner() {
		require(msg.sender == admin);
		_;
	}

    event addedEvent(
        address indexed _addr
    );

    /* -------------------------- FUNCTIONS ----------------------------- */

    function addTeacher(address _addr, string memory _course) public onlyOwner{
        // Require that the teacher is not added yet
        require(!isTeacherAdded[_addr]);

        // Add the teacher
        isTeacherAdded[_addr] = true;
        teachersList.push(_addr);
        teachersCount ++;
        teachers[_addr] = Teacher(teachersCount, _course);

        // Trigger event
        emit addedEvent(_addr);
    }

    function addStudent(address _addr, string memory _roll, string memory _name) public onlyOwner{
        // Require that the student is not added yet
        require(!isStudAdded[_addr]);

        // Add the student
        isStudAdded[_addr] = true;
        studentsList.push(_addr);
        studentsCount ++;
        students[_addr] = Student(studentsCount, _roll, _name);

        // Trigger event
        emit addedEvent(_addr);
    }

    function addGrade(address _studAddress, string memory _grade) public {
        // Add the grade
        students[_studAddress].grades[msg.sender] = _grade;
    }

    function getGrade(address _studAddress, address _teacherAddr) public view returns (string memory _grade) {
        _grade = students[_studAddress].grades[_teacherAddr];
    }

}