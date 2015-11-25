# README

C++ Intellisense 

Please go to [https://github.com/austin-----/code-gnu-global](https://github.com/austin-----/code-gnu-global) for source code, bug tracking, and feature request

## Functionality
Provide Intellisense for C/C++ with the help of the GNU Global tool in Visual Studio Code.

## Usage
1. Make sure you have GNU Global tool installed and added to PATH. 

2. In the workspace folder of your C/C++ project, run 'gtags'. This will generate the GTAGS, GRTAGS, and GPATH files. If you made changes to your code, run 'gtags' again to renew the tag files.

3. Install 'C++ Intellisense' in VS Code and then you can enjoy Intellisense for this project in VS Code.

## Demo
* Go to definition

![Go to definition](screenshots/screen.gif)

* Auto completion

![Auto completion](screenshots/auto_completion.png)

* Find references

![Find references](screenshots/find_ref.png)

* List symbols

![List symbols](screenshots/list_symbols.png)

## Limitations
Since GNU Global is a tagging system, it does not do any AST parsing to understand class members and etc. 

### For more information
* [GNU Global](https://www.gnu.org/software/global/)
* [Repo](https://github.com/austin-----/code-gnu-global)
* [VS Code Marketplace](https://marketplace.visualstudio.com/items/austin.code-gnu-global)

** Enjoy! **
