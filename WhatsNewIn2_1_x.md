
# Whats new / has changed from 2.0.x #

First of all, PRS+ custom dictionary support is on its way, but still not integrated into the current nightly versions!

---


## Author List ##

This addon allows you to browse your books by author. It is a basic implementation of the 'Books by Author' functionality already available on non-touch models.

| **Minimum Books per Author** | Only list authors with at least this number of books. |
|:-----------------------------|:------------------------------------------------------|


---


## Book Management ##
Pre-x50 models support only a few of the options listed below.

### Customize Home Menu Booklist ###
#### Show Home Menu Arrows ####
With this enabled, four arrows will appear in the Home Menu, allowing you to control the booklist.
#### Page Buttons in Home Menu ####
This option allows you to change the behaviour of the page buttons when in the Home Menu. By default, they behave as follows:
| **Previous** |Previous Books|
|:-------------|:-------------|
| **Next**     | Next Books   |
| **Holding Previous** | Cycle Backward (previous booklist)|
| **Holding Next** | Cycle Forward (next booklist)|

Note that if actions are assigned to the same buttons in "Key Bindings", those will take precedence.

### Collections ###
#### Add Read Books Collection ####
Adds a collection showing all opened/read books (the inverse of the 'Unread Books' collection).
#### Sub-Collections ####
Allows you to create unlimited extra levels of collections by putting separators in the name.<br>
Here are a few examples based on the default separator (<b>|</b>):<br>
<table><thead><th> <b>Name</b> </th><th> <b>Will become</b> </th></thead><tbody>
<tr><td> Genres|Fantasy </td><td> Genres -> Fantasy  </td></tr>
<tr><td> Genres|Fantasy|Series|Harry Potter </td><td> Genres -> Fantasy -> Series -> Harry Potter </td></tr></tbody></table>

It is recommended to use Calibre to automatically create such collection names from available tags/series/etc (for example, like <a href='http://www.mobileread.com/forums/showpost.php?p=1977464&postcount=3425'>this</a>).<br>
<h4>Sub-Collections Separator</h4>
This setting determines which character is used to split sub-collections. The default is the pipe character (<b>|</b>).<br>
The other options are: period (<b>.</b>) comma (<b>,</b>) colon (<b>:</b>) semi-colon (<b>;</b>) forward slash (<b>/</b>) tilde (<b>~</b>).<br>
<br>
<h3>Show Reading Progress</h3>
<h4>Show for Thumbnails</h4>
This option now also allows you to show progress only in the Home Menu.<br>
<br>
<h3>Hide Saved Notepads</h3>
Hides text files created by the 'Save Notepad Data' addon from the home menu & regular booklists.<br>
<h3>Book Flags</h3>
Allows you to change the looks and behaviour of the 'New' flag.<br>
<table><thead><th> <b>Automatic 'New' Flag</b> </th><th> Default behaviour. </th></thead><tbody>
<tr><td> <b>Manual 'New' Flag</b>    </td><td> Keep the 'New' flag, but don't remove it automatically. </td></tr>
<tr><td> <b>Manual Checkmark</b>     </td><td> Don't show the 'New' flag. Mark read books with a checkmark instead. </td></tr></tbody></table>

If set to either of the manual options, an entry is added to the book option menu to allow you to toggle the flag.<br>
<h3>Mark All Books</h3>
Use this entry to mark all your books read or unread in one go.<br>
<h3>Clear Page History on Shutdown</h3>
If enabled, all page history in all books is wiped on shutdown, to decrease the size of the cache file and improve loading times.<br>
Note that 'current position' information is <b>not</b> removed.<br>
<h3>Content Search</h3>
This allows the user to search through the text of <b>all</b> books in a list / collection / folder. Access is via the regular search function: when starting a new search, the user is asked whether to do a content search or a regular (title) search.<br>
<b>Note:</b> the content search is a relatively slow and cpu-intensive process. We recommend to use it sparingly.<br>
<h3>Page Option Items</h3>
This list of settings allows you to hide items from the book option menu. This is mostly useful to prevent the menu from getting longer than 10 items due to new options ('Add to Collection', 'Mark as Read/Unread').<br>
<hr />

<h2>Book Viewer</h2>
Most options are only for 600/x50 models, except where 300/505 support is explicit stated!<br>
<br>
Touch-related options have been moved to <b>Touch Settings</b>.<br>
<h3>Automatic Page Turner</h3>
Note that this feature was (by mistake) not included for 600 models. (where it would also consume much power as with 300/505 models)<br>
<br>
This option allows you to set the time between page turns. The page turner itself is toggled using an action.<br>
Note: on 300/505 (and on 600, once we add it), the automatic page turner might lead to high battery drain.<br>
<h3>Custom View Settings</h3>
<h4>Activate Custom Settings</h4>
Not restricted to the 'Restore' button anymore: you can now choose to overrule any of the default presets (Original, Saturated, Details, Brighter, Darker).<br>
<h3>No Flash when Closing Overlays</h3>
Enabling this prevents full screen refreshes when closing overlays (option menus, dictionary popup, etc).<br>
<h3>Show Parent Items in ToC</h3>
For multi-level ToC's, this adds parent items as bookmarks to their own submenu. For instance, say your ToC has an entry 'Part I', which contains other bookmarks (say 'Chapter 1' and 'Chapter 2'). Normally, selecting 'Part I' just shows you the sub-items, but you cannot go to 'Part I' itself. So now, the 'Part I' sub-menu will get an extra entry, which points to the start of 'Part I'.<br>
<h3>User EPUB Style (CSS File)</h3>
This item is now available from the Option menu while reading a book.<br>
<h3>MarginCut (for 300/505)</h3>
Implements a basic Margin-Cut-Functionality for 300/505.<br>
Especially for PDF's (but is working with EPUB und LRF too) with zoom-setting "S". Margin-Cut rectangle can only be set in portrait-mode, but will also work in landscape if rotated afterwards.<br>
There is a key-bindable action, but can also be accessed with the size-popup-menu.<br>
<h3>New PopUpMenu for 300/505 when Size-Button is pressed</h3>
PopUpMenu with direct access to all three (3) base-font-sizes, rotate and margin-cut.<br>
For EPUBs there are additional options to choose from 7 extra-fontsizes, control linespacing, indent and margin.<br>
<h3>Extended SizeOverlay for x50</h3>
SizeOverlay (the dialog shown when you press the Size-/Magnifier-button) provides extra buttons to control fine-fontsize-tuning, lineheight and text-align. Use the middle-button to access more CSS-Options. Working only with epubs by modifying style.css.<br>
At first use of the extended options in the font dialoge, book font will revert to default. Just select your custom font again.<br>
<br>
<h4>User Values for CSS Tweaking (see above)</h4>
User values for CSS can be put in the file <b>userCSSValues.js</b> in /database/system/PRSPlus/<br>
(After installation there should be two (2) templates ending 300_505 / x50, delete the ending and alter the content in the square-brackets <code>[]</code> to your liking. (Notice that the values for Lineheight in the x_50 dialoge will not change)<br>
<br>
Edit <b>extern.css</b> in /database/system/PRSPlus/epub/ to choose which selectors are affected by CSS-tweaking.<br>
<br>
<h3>PageStyle will be retained</h3>
With unaltered reader PageStyle (like margin-remove or multi-columns) will be reset once you change back to the home-screen.<br>
With this alteration, PageStyle will be retained for the current book.<br>
It will be reset to "original" if you open another book.<br>
<hr />

<h2>Browse Folders</h2>
Browse Folders can now handle archives (including comic archives) and audio files.<br>
<br>
<b>Remark:</b> Development still in progress. There is a problem with the character-encoding (CP-850) in archive processing. Thus archived filenames involving Unicode characters (like German umlauts) may fail.<br>
<br>
<h3>Archives</h3>
Archives have an icon that looks like a folder being squeezed in a vice.  If you click on an archive you will see the contents of the archive.<br>
<br>
Then if you click on a BOOK in an archive you will be given the choice to "Copy", "Copy and Open" or "Preview" the book.  (Note that there is no Preview option on the 505/300 models.)  If you choose to Copy (or Copy and Open) the file will be copied to the internal memory.  If you choose "Preview" the book will be extracted to a temporary directory and will then open.  Once you stop looking at the book it will be deleted (and your previous current book will be restored.)<br>
<br>
If you click on an IMAGE in an archive the image will appear.  To get back to the file list you need to press OPTIONS and select "Return to List".  (PREVIOUS, NEXT and SIZE will work if there are other images in the current folder.  This is essentially the same thing as Comics.)<br>
<br>
<h3>Comics</h3>
If, on the other hand, the archive is a CBR, CBZ or CB7 file (let's just call it a COMIC), the icon will be a speech bubble.  If you click on a COMIC, you will see the contents of the archive (which may itself be a folder, so click on that).  You should (eventually) see a list of images.  Click on the first image to start reading the COMIC.<br>
<br>
Note that reading a COMIC does not interfere with your current book.  It also means that when you browse away from the COMIC your place will not be remembered.<br>
<br>
You can use the PREVIOUS and NEXT buttons to move through the COMIC.  You can also press the SIZE button to open the zoom function.  If you press NEXT while using the zoom function you will stay in the zoom function and the next image will be automatically repositioned to the top left corner.<br>
<br>
<h3>Audio</h3>
Audio (MP3 and AAC) files will now appear in Browse Folders (but not in archives).  Click on the audio file to start the music player.  Pressing PREVIOUS and NEXT will move through the music files that are located in the current folder.  (Note that if there are items of a different sort, like a book or an image, then these will open, thereby closing the music player.)<br>
<br>
You can use the shuffle option.  However, using shuffle is incompatible with the ".." item (which if randomly selected as "the next track" will send you to the parent folder thereby closing the music player).  So if you want to use shuffle make sure you disable the ".." setting in the Browse Folder's settings page.<br>
<br>
You can also continue reading if you wish, just as you can with the built-in Audio library, but only the songs in the current folder will be played.<br>
<br>
<h3>Configuration file to hide specific folders from scanning</h3>
All folders noted in /database/system/PRSPlus/dontscan.cfg<br>
are excluded from scanning. All books and pictures in those folders will not show up in any media-node.<br>
Content can by access via BrowseFolders<br>
Initially all folders starting with "Beta" and "ScreenShots" are hidden from the media-nodes.<br>
<hr />

<h2>Dictionary Options (x50)</h2>
In addition to the options below, the dictionary popup now shows left/right arrows. These allow you to view the previous/next entry in the dictionary.<br>
<table><thead><th> <b>No Dictionary with DoubleTap</b> </th><th> Don't activate the dictionary when double-tapping words. </th></thead><tbody>
<tr><td> <b>Popup Position</b>               </td><td> Move the dictionary popup to the top, or 'avoid overlapping selection' (popup shows at the top if selected text is at the bottom, and vice versa). </td></tr>
<tr><td> <b>Close Popup by Page Tap</b>      </td><td> Tap the page to close the popup.                         </td></tr>
<tr><td> <b>Popup Lines</b>                  </td><td> Change the number of lines in the popup.                 </td></tr>
<tr><td> <b>Keep Selection after Dictionary</b> </td><td> When going from popup to full-screen dictionary, retain text selection afterwards, so you can see where you left off. </td></tr>
<tr><td> <b>Maximum Word Log Items</b>       </td><td> Maximum number of items to store in Word Logs (both books and dictionaries) </td></tr>
<tr><td> <b>Clear Word Logs on Shutdown</b>  </td><td> Wipe all Word Logs, to decrease the size of the cache file and improve loading times. </td></tr>
<tr><td> <b>Remember Book Dictionary</b>     </td><td> On opening a book, change the dictionary to the one last used for that book. </td></tr></tbody></table>

<hr />

<h2>Key Bindings</h2>
Actions can now also be assigned to the Page buttons.<br>
<hr />

<h2>Menu Customizer (600/x50)</h2>
Standard apps can now be added to the Home page:<br>
<ul><li>Music Player (to show the currently playing song if there is one; if it is not playing it will automatically start; if there is no current song, then the Music Library will open instead)<br>
</li><li>Music Library<br>
</li><li>Text Memos<br>
</li><li>Handwritings<br>
</li><li>Dictionary<br>
<hr /></li></ul>

<h2>Music Player</h2>
<h3>Volume Increment</h3>
Allows you to choose the size of the steps with which the volume is increased/decreased.<br>
<hr />

<h2>Standby/Shutdown</h2>
In addition to showing images in standby, it is now also possible to show images when the device is turned off.<br>
<h3>Standby/Shutdown Image</h3>
<table><thead><th> <b>Image Type</b> </th><th> <i>System Standby Function, White Screen, Black Screen, Current Book Cover, Current Screen, Calendar and Events.</i><br><br>If set to 'Calendar and Events', when the reader goes into Standby (or Shutdown) a calendar displaying the current month (including event icons) is displayed, as well as a list of events.  If there are any events on the current day, these will be at the top of the event box underneath the "Today's Events" heading.  If there are up-coming events in the rest of the current month and in the next month, these will be displayed underneath the "Up-coming Events" heading.  (Note that there is a size limit to this box, so only up to six or seven events will be displayed.) </th></thead><tbody>
<tr><td> <b>Display Icon</b> </td><td> Shows an icon in the corner, by which you can tell if the device is in standby or shut down.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           </td></tr>
<tr><td> <b>Display Custom Text</b> </td><td> Show custom text in the bottom. To change the text, edit <b>/database/system/PRSPlus/customtext.cfg</b>.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               </td></tr>
<tr><td> <b>Display Events Overlay</b> </td><td> If there are events (either today's or up-coming) then an overlay event box will be displayed on top of whatever the standby (or shutdown) image is.  So using this option, you can, for example, display the current book cover and also see your events at the same time.                                                                                                                                                                                                                                                                                                                                                                                                                                            </td></tr></tbody></table>

<h3>Image Scaling</h3>
Allows you to either stretch book covers to fit the screen, or maximize size while keeping aspect ratio.<br>
<h3>USB Transfer Mode Dialog</h3>
Allows you to either keep reading while charging via USB, or enter data transfer mode.<br>
<h3>Auto Standby Time</h3>
Allows you to change the time before the reader goes into standby when idle.<br>
<h3>Auto Shutdown Time</h3>
Allows you to change the time before the reader shuts down when in standby.<br>
<hr />

<h2>Save Notepad Data (600/x50)</h2>
This addon allows you to extract text from Notepads created using the reader's Text Memo and Handwriting applications.<br>
<br>
<table><thead><th> <b>Save Text Memo as TXT File</b> </th><th>If this option is on, whenever you create (or edit) a Text Memo a TXT file will be created containing the contents of the Text Memo.  It will be saved in the location indicated by the last option.  (Note that if you edit an existing Text Memo, the associated TXT file will be overwritten.) In addition, if you make notes attached to bookmarks, these notes will be saved into a single TXT file associated with that particular book.  In this case, changes to existing notes will appear in the TXT file as separate notes.  Note that notes attached to bookmarks (and the content of highlights) will be listed in the order they were added, <i>not</i> according to the book's page numbers.</th></thead><tbody>
<tr><td> <b>Override Text Memo with TXT File</b> </td><td>If this option is on, any changes made to the TXT file associated with a particular Text Memo (made while your reader was connected to your computer) will be loaded when the Text Memo is loaded.  Note, though, that the Text Memo on the reader will not be updated unless you save the Text Memo after making a change using the reader's Text Memo edit function.                                                                                                                                                                                                                                                                                                                                     </td></tr>
<tr><td> <b>Save Handwriting as SVG File</b> </td><td>If this option is on, whenever you create (or edit) a Handwriting an SVG file will be created.  It will be saved in the location indicated by the last option.  This SVG file can then be loaded into an SVG-compatible program (such as Inkscape).  (Note that if you edit an existing Handwriting, the associated SVG file will be overwritten.) In addition, if you make scribbles attached to bookmarks, these scribbles will be saved as separate SVG files.                                                                                                                                                                                                                                          </td></tr>
<tr><td> <b>Save Handwriting as JPG File</b> </td><td>If this option is on, whenever you create (or edit) a Handwriting JPG file will be created.  It will be saved in the location indicated by the last option.  (Note that if you edit an existing Handwriting, the associated JPG file will be overwritten.) In addition, if you make scribbles attached to bookmarks, these scribbles will be saved as separate JPG files.                                                                                                                                                                                                                                                                                                                                  </td></tr>
<tr><td> <b>Save Contents of Highlights</b> </td><td>If this option is on, whenever you highlight any text in a book the content of the highlight will be saved into the single TXT file associated with that particular book.  Note that the content of highlights (and notes attached to bookmarks) will be listed in the order they were added, <i>not</i> according to the book's page numbers.                                                                                                                                                                                                                                                                                                                                                             </td></tr>
<tr><td> <b>Show Save Progress</b>         </td><td>If this option is on, a message will appear on the reader screen indicating that the Notepad data is being saved.  Note that error messages will be displayed even if this option is off.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </td></tr>
<tr><td> <b>Save to</b>                    </td><td>This option allows you to choose where the Notepad data will be saved to.  The choices are  "Memory Stick", "SD card" and "Internal Memory".  Then, in the location you choose, the Notepad data will be saved into a directory entitled "Notepads".                                                                                                                                                                                                                                                                                                                                                                                                                                                       </td></tr></tbody></table>

<hr />

<h2>Status Bar</h2>
<h3>Page Index</h3>
<h4>Index Style in Books</h4>
New option: '5 / 100 (pages to next chapter)'.<br>
<hr />

<h2>Touch Settings</h2>
<h3>Tap Options</h3>
<table><thead><th> <b>Custom Page Tap Actions</b> </th><th>This option lets you assign <b>any</b> actions (not only pageturns) to single taps into specific areas of the page. Other than in version 2.0.x, the screen is divided into four areas.</th></thead><tbody>
<tr><td> <b>Disable Bookmark Tapping</b> </td><td> Disable (de)bookmarking by tapping the top right corner of the page.                                                                                                                  </td></tr>
<tr><td> <b>Extend Link Tap Areas</b>   </td><td>Makes it easier to hit links (e.g. footnotes). Especially useful if Custom Page Tap Actions are enabled.                                                                               </td></tr>
<tr><td> <b>DoubleTap Speed</b>         </td><td> Set the maximum time between two taps. Increase to make double tapping easier, decrease to improve response time.                                                                     </td></tr>
<tr><td> <b>Switch Page Tap/DoubleTap</b> </td><td> Page tap behaves as a doubletap, and vice versa.                                                                                                                                      </td></tr></tbody></table>

<h3>Swipe Options</h3>

<table><thead><th> <b>Custom Swipe Actions</b> </th><th>Assign <b>any</b> actions to four swipe directions (left, right, up, down).</th></thead><tbody>
<tr><td> <b>Disable All Swipes</b>   </td><td> Disables all swipe functionality.                                         </td></tr></tbody></table>

<h3>Zoom Options</h3>
<table><thead><th> <b>ZoomLock: Panning</b> </th><th>Enable panning (dragging the page) while in ZoomLock.</th></thead><tbody>
<tr><td> <b>ZoomLock: Single Tap Action</b> </td><td>Zoom out or zoom in when tapping the page.           </td></tr>
<tr><td> <b>ZoomLock: Double Tap Action</b> </td><td>Zoom out or zoom in when double tapping the page.    </td></tr>
<tr><td> <b>Move to Top on Next Page</b> </td><td>In ZoomLock, move to the top of the page after a page turn.</td></tr></tbody></table>

<h4>Disable Predictive Text</h4>
The keyboard will no longer show words it thinks you're typing.<br>
<hr />

<h2>Developer Tools</h2>
<h3>CLI App</h3>
The CLI (command-line interface) app allows the user to enter bash commands directly on the reader.  It should work like a proper linux terminal.  You can change the current directory using the 'cd' command (and the current directory is indicated in the prompt).  Note that you should probably only use commands that will terminate.<br>
<br>
If you want to output the content of a file, use 'more':<br>
<pre><code>more /Data/runonce.sh<br>
</code></pre>

The "^" button immediately below the "OK" button will cycle through previous commands.<br>
<br>
This app is NOT included in the reader interface by default.  If you want to use this app, you will need to uncomment the following lines in the config file for your particular reader model:<br>
<br>
600/x50:<br>
<pre><code>{ name: "Cli", parent: "more" },<br>
</code></pre>

505/300:<br>
<pre><code>{ name: "Cli", parent: "gamesAndUtils" },<br>
</code></pre>

Then build a custom installer.<br>
<br>
<br>
<h2>Available Actions</h2>
<h3>Utilities</h3>
<table><thead><th> <b>Action Launcher</b> </th><th>Allows you to execute an action of your choice.</th></thead><tbody>
<tr><td> <b>Delete Current Item</b> </td><td>                                               </td></tr>
<tr><td> <b>Toggle Swiping</b>  </td><td>                                               </td></tr>
<tr><td> <b>Toggle Touchscreen</b> </td><td>Enables/disables the touch screen. Note: can only be used when bound to a key.</td></tr>
<tr><td> <b>Switch Page Tap/DoubleTap</b> </td><td>                                               </td></tr></tbody></table>

<h3>Book</h3>
<table><thead><th> <b>Go to Previous Book</b> </th><th>Go to the book opened before the current one.</th></thead><tbody>
<tr><td> <b>Reformat Current Book</b> </td><td>Reformat current lrf/txt book (useful if PRS+ text scale setting has been changed).</td></tr>
<tr><td> <b>User EPUB Style (CSS File)</b> </td><td>Change CSS file for current book (no reload necessary).</td></tr>
<tr><td> <b>Next Chapter</b>        </td><td>Jump to next chapter.                        </td></tr>
<tr><td> <b>Previous Chapter</b>    </td><td>Jump to previous chapter.                    </td></tr>
<tr><td> <b>Toggle True Landscape Mode</b> </td><td>Enables 'true' landscape mode, which reflows the text instead of Sony's silly default behaviour.</td></tr>
<tr><td> <b>Toggle Automatic Page Turner</b> </td><td>                                             </td></tr>
<tr><td> <b>Activate ZoomLock</b>   </td><td>                                             </td></tr></tbody></table>

<h3>Other</h3>

<table><thead><th> <b>No Action</b> </th><th>  </th></thead><tbody>
<tr><td> <b>Goto various nodes</b> </td><td>Games, Pictures, Periodicals, Collections, Text Memos, Handwritings... and More!</td></tr>
<tr><td> <b>Delete Current Item</b> </td><td>should work for book, audio and picture</td></tr>
<tr><td> <b>Pause/Play Audio</b> </td><td>if there is a current song</td></tr>
<tr><td> <b>Booklist: Cycle Forward</b> </td><td>Home Menu booklist: next booklist</td></tr>
<tr><td> <b>Booklist: Cycle Backward</b> </td><td>Home Menu booklist: previous booklist</td></tr>
<tr><td> <b>Booklist: Next Books</b> </td><td>Home Menu booklist: next books</td></tr>
<tr><td> <b>Booklist: Previous Books</b> </td><td>Home Menu booklist: previous books</td></tr>
<tr><td> <b>Booklist: Select Collection</b> </td><td>Home Menu booklist: jump to 'Select Collection'</td></tr></tbody></table>

<h2>Games</h2>
<h3>Chess</h3>
The AI has been greatly improved.  It now uses Toga II v1.3.1 (see <a href='http://www.superchessengine.com/toga_ii.htm'>http://www.superchessengine.com/toga_ii.htm</a>).<br>
<br>
The three levels are defined by the maximum time the AI can take to decide on a move:<br>
<ul><li>Fast - 2 seconds<br>
</li><li>Medium - 10 seconds<br>
</li><li>Slow - 30 seconds</li></ul>

The AI also uses a "book" to speed up moves in the early stages of a game.  This file is named 'performance.bin' and can be found in the GamesSave folder for Chess:<br>
<i><b>database/system/PRSPlus/GamesSave/Chess/</b></i> in the Internal Memory.<br>
The one that comes with PRS+ was downloaded from <a href='http://wbec-ridderkerk.nl/html/download.htm'>http://wbec-ridderkerk.nl/html/download.htm</a>.<br>
You can use your own file, but remember that it will be over-written every time that you update PRS+.<br>
<br>
You can now play as black if you wish.  Just click the "New Game" button twice (it changes to say "As Black" after the first click; the button says "As Black" when you start Chess so you only need to click it once).  The black pieces will now be at the bottom of the screen (and white will make its first move if you are in auto mode).<br>
<br>
<h3>Interactive Fiction</h3>
Interactive Fiction is essentially a "front-end" for Frotz (<a href='http://frotz.sourceforge.net/'>http://frotz.sourceforge.net/</a>) and Nitfol (<a href='http://www.ifarchive.org/indexes/if-archiveXinfocomXinterpretersXnitfol.html'>http://www.ifarchive.org/indexes/if-archiveXinfocomXinterpretersXnitfol.html</a>).  Unfortunately, due to space issues, only Frotz is available on the 505/300 models.  Both Frotz and Nitfol are available on the 600/x50 models.<br>
<br>
Game files (either .dat or .z5 files; 600/x50 users can also use .z8 and .zblorb files) need to be copied into a specific folder on the reader:<br>
<i><b>database/system/PRSPlus/GamesSave/Frotz/</b></i> in the Internal Memory.<br>
<br>
However, 600/x50 models will be able to play a game straight away.  The PRS+ installer now comes with "Mortlake Manor", a fairly simple adventure game which should provide people with a gentle introduction to Interactive Fiction: you can't die, you cannot get into a non-winnable situation, and the puzzles are not too hard.  (You may find it helps to draw a map as you go, though...)<br>
<br>
The following classic Infocom games have been tried and run. (At least, they start.  They may not work correctly throughout the entire game.)  Many of these only work with customised settings, so make sure the filename is the same as the game name listed below (or given in brackets if the filename differs from the game name):<br>
<br>
<ul><li>A Mind Forever Voyaging (amfv)<br>
</li><li>Ballyhoo<br>
</li><li>Bureaucracy (bureau) - see note below<br>
</li><li>Enchanter<br>
</li><li>Hitchhiker's Guide To The Galaxy (hhgg)<br>
</li><li>Infidel<br>
</li><li>Leather Goddesses of Phobos (phobos)<br>
</li><li>The Lurking Horror (lurking)<br>
</li><li>Moonmist<br>
</li><li>Planetfall<br>
</li><li>Plunderer<br>
</li><li>Sorcerer<br>
</li><li>Spellbreaker<br>
</li><li>Stationfall<br>
</li><li>Suspect<br>
</li><li>Suspended<br>
</li><li>Trinity<br>
</li><li>Wishbringer<br>
</li><li>Witness<br>
</li><li>Zork1 - see note below<br>
</li><li>Zork2<br>
</li><li>Zork3</li></ul>

SPECIAL NOTE REGARDING BUREAUCRACY:<br>
You will need to create an initial gamesave before you can play the game on your reader.  For example, start the game using WinFrotz (<a href='http://www.ifarchive.org/if-archive/infocom/interpreters/frotz/WindowsFrotzInstaller.exe'>http://www.ifarchive.org/if-archive/infocom/interpreters/frotz/WindowsFrotzInstaller.exe</a>), and fill in the license form.  When this is completed, the first room description appears.  Save the game now, calling the save file 'userinput.sav'.  Then copy this file to your reader into <i><b>database/system/PRSPlus/GamesSave/Frotz/bureau/</b></i> in the Internal Memory.<br>
<br>
SPECIAL NOTE REGARDING ZORK1:<br>
There was a problem saving and restoring a game in the 'loud' room (Frotz would crash).  So, as a work-around, as soon as the player gets close to the 'loud' room, "echo" is added to the input stream automatically, thereby dealing with the 'loudness' problem and allowing the game to continue.  Once the 'loud' room has been dealt with, "echo" is not added to the input stream any more. (Note that this workaround will affect the number of moves slightly.)<br>
<br>
SPECIAL NOTE FOR 600/X50 USERS:<br>
More recent Interactive Fiction files now work on 600/x50 using Nitfol.  However, a particular game may require customised input/output to run correctly.  If you would like to play a particular game and it doesn't start or behave properly, please let us know.<br>
<br>
The following games have been tested successfully:<br>
<br>
<ul><li>9:05 (905.z5)<br>
</li><li>Adventure, also known as Colossal Cave (advent.z5)<br>
</li><li>All Things Devours (devours.z5)<br>
</li><li>Anchorhead (anchor.z8)<br>
</li><li>Bronze (bronze.zblorb)<br>
</li><li>Curses! (curses.z5)<br>
</li><li>Lost Pig (lostpig.z8)<br>
</li><li>Party Foul (partyfoul.zblorb)<br>
</li><li>Savoir-Faire (savoir-faire.zblorb)<br>
</li><li>Slouching Towards Bedlam (slouch.z5)<br>
</li><li>Spider and Web (tangle.z5)</li></ul>

Get games from<br>
<ul><li><a href='http://www.batmantis.com/zorks/'>http://www.batmantis.com/zorks/</a>
</li><li><a href='http://ifdb.tads.org/'>http://ifdb.tads.org/</a>
</li><li><a href='http://wurb.com/if/'>http://wurb.com/if/</a>
</li><li><a href='http://ifiction.free.fr/index.php?id=jeux'>http://ifiction.free.fr/index.php?id=jeux</a> (IF in French)