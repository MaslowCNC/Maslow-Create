# A web based CAD program for cooperative design.

[![Build Status](https://travis-ci.org/BarbourSmith/Maslow-Create.svg?branch=master)](https://travis-ci.org/BarbourSmith/Maslow-Create)


![overview](https://github.com/BarbourSmith/Maslow-Create/blob/master/MaslowCreate.png)

Maslow create breaks with the tradition of CAD programs which inherit from drawing programs and instead inherits from logical languages like programing. This allows it to be a CAD program which has language like features such as importing modules, version control, and colaboration.

## Getting Started

1.  Clone the repo:

        git clone https://github.com/BarbourSmith/Maslow-Create.git

2.  Install dependencies:

        npm install

3.  Run webpack:

        npm start

Your canvas piece should open up automatically at http://localhost:3000 and you should see 'HTML CANVAS BOILERPLATE' on hover.

## Layout of the program

Maslow Create has three main areas of the interface. Along the top of the screen is the logical flow of the design. In the lower left is a 3D rendering of the design, and in the lower right is the side bar which displays information related to the currently selected atom. If no atom is selected, then information about the open molecule is displayed.

The logical flow of the design is composed of nodes called Atoms which are connected by connectors. Each atom has a number of attachment points where connectors can connect. Each atom type inherits from the atom class which is defined in the file `/dist/js/molecules/prototypes.js`. Each atom type then has it's own file which modifies the behavior of the default atom class.

The lower left 3D rendring is an instance of the JSCAD project. It is currently a hacked version of 1.x while waiting for version 2 to be released. Right now the generated code is done through string manipulation. In version 2 we will pass actual JS objects to functions.

The lower right corner of the screen is called the "Side Bar" It contains information about the currently selected atom. It is populated by that atom's "Generate Sidebar" function.
