  ┃  the session."}]}'; done; echo '--- reply ---'; head -c 350 /tmp/prod-lite-chat-1.txt; echo                                                                        
  ┃                                                                                                                            Removing solution 3 from QA course      
  ┃  {"status":"ok","checks":{"gemini":true},"model":"gemini-3.5-flash-lite"}                                                  evaluation                              
  ┃  chat 1: ttfb=1.394173s total=1.639243s http=200                                                                                                                   
  ┃  chat 2: ttfb=1.485710s total=1.531236s http=200                                                                           Context                                 
  ┃  chat 3: ttfb=1.230584s total=1.409686s http=200                                                                           72,681 tokens                           
  ┃  --- reply ---                                                                                                             36% used                                
  ┃  data: {"text":"Not having the lab manual beforehand "}                                                                    $0.00 spent                             
  ┃                                                                                                                                                                    
  ┃  data: {"text":"must have made it quite difficult to follow along with Mr. Mukyaake during that long Monday morning        LSP                                     
  ┃  block. Did you manage to get some guidance"}                                                                              LSPs are disabled                       
  ┃                                                                                                                                                                    
  ┃  data: {"text":" or support from h"}                                                                                                                               
  ┃  …                                                                                                                                                                 
  ┃                                                                                                                                                                    
  ┃  Click to expand                                                                                                                                                   
  ┃                                                                                                                                                                    
                                                                                                                                                                       
  ┃                                                                                                                                                                    
  ┃  $ for i in 1 2; do curl -sS --max-time 120 -o /tmp/prod-lite-report-$i.json -w "report $i: ttfb=%{time_starttransfer}                                             
  ┃  s total=%{time_total}s http=%{http_code}\n" -X POST https://qaai-eight.vercel.app/api/report -H 'Content-Type:                                                    
  ┃  application/json' -d '{"messages":[{"role":"assistant","content":"How were your units this semester?"},{"role":"user",                                            
  ┃  "content":"Data Mining was okay but the labs were unclear."},{"role":"assistant","content":"What about the lecturer?"}                                            
  ┃  ,{"role":"user","content":"He explained well but never gave feedback on assignments."},{"role":"assistant","content":                                             
  ┃  "Anything else?"},{"role":"user","content":"The venue was too small for the class."}]}'; done; node -e 'const                                                     
  ┃  d=require("/tmp/prod-lite-report-1.json"); console.log(d.error ? "ERROR: "+d.error : "headline: "+d.report.headline+"       ⬖ Getting started                ✕    
  ┃  | sentiment: "+d.report.overallSentiment)'                                                                                                                        
  ┃                                                                                                                                OpenCode includes free models       
  ┃  report 1: ttfb=13.668139s total=13.668428s http=200                                                                           so you can start immediately.       
  ┃  report 2: ttfb=15.920012s total=15.920332s http=200                                                                                                               
  ┃  headline: Course Evaluation Summary for Data Mining and Business Intelligence | sentiment: Mixed                              Connect from 75+ providers to       
  ┃                                                                                                                                use other models, including         
                                                                                                                                   Claude, GPT, Gemini etc             
     ▣  Build · Big Pickle                                                                                                                                             
                                                                                                                                   Connect provider        /connect    
  ┃                                                                                                                                                                    
  ┃                                                                                                                                                                    
  ┃                                                                                                                            ~/Documents/projects/qa-with-gemini:    
  ┃  Build · Big Pickle OpenCode                                                                                               main                                    
  ╹▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀                                            
   ⬝⬝⬝⬝⬝⬝■■ Free usage exceeded, subscribe to Go [retrying in 3h 27m attempt #1]                              esc interrupt    • OpenCode 1.18.35                      
                                                                                                                                                                       