package com.ctrainer.ctrl;

import com.ctrainer.model.Res;
import com.ctrainer.model.Usr;
import com.ctrainer.repo.ResRepo;
import com.ctrainer.repo.UsrRepo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ApiCtrl {

    private final UsrRepo urp;
    private final ResRepo rrp;

    public ApiCtrl(UsrRepo urp, ResRepo rrp) {
        this.urp = urp;
        this.rrp = rrp;
    }

    @PostMapping("/reg")
    public ResponseEntity<Usr> reg(@RequestBody Usr usr) {
        if (urp.findByNick(usr.getNick()).isPresent()) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        Usr saved = urp.save(usr);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<Usr> login(@RequestBody Map<String, String> creds) {
        Optional<Usr> usr = urp.findByNick(creds.get("nick"));
        return usr.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @PostMapping("/res")
    public Res saveRes(@RequestBody Map<String, Object> pld) {
        Res res = new Res();
        res.setUid(Long.parseLong(pld.get("uid").toString()));
        res.setScr(Integer.parseInt(pld.get("scr").toString()));
        res.setMod(pld.get("mod").toString());
        res.setTs(LocalDateTime.now());
        return rrp.save(res);
    }

    @GetMapping("/prof/{uid}")
    public List<Res> getProf(@PathVariable Long uid) {
        return rrp.findByUidOrderByTsDesc(uid);
    }
}